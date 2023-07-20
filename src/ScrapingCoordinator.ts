import { Page } from "puppeteer";
import { CrawlerInterface } from "./crawlers/types";
import { InstructionStep, Instructions } from "./instructions/types";
import { AbstractWriter } from "./outputWriters/types";
import { wait } from "./utils";

import config from "config";
import { databaseManager } from "./DatabaseManager";
import { Collection } from "mongodb";

enum PageStatus {
  Pending = "pending",
  Processing = "processing",
  Done = "done",
}

interface PageToVisitSchema {
  link: string;
  status?: PageStatus;
  discoveredAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export default class ScrapingCoordinator {
  /**
   * @var {CrawlerInterface} crawler a class that interacts with the page and its content
   */
  #crawler: CrawlerInterface;

  #outputWriter: AbstractWriter;

  /**
   * @var {number} delayTimer how long to wait before processing the next page
   */
  #delayTimer: number;

  /**
   * @var {object} instructions instructions that describe how to navigate and collect data from a page
   */
  #instructions;

  #tabCount = 1;

  #pageCollection: Collection<PageToVisitSchema>;

  constructor(
    crawler: CrawlerInterface,
    outputWriter: AbstractWriter,
    instructions: Instructions,
  ) {
    this.#crawler = crawler;
    this.#instructions = instructions;
    this.#outputWriter = outputWriter;

    this.#delayTimer = config.get<number>("coordinator.delay");
    this.#tabCount = config.get<number>("coordinator.tabCount");

    this.#pageCollection = databaseManager.collection<PageToVisitSchema>(
      config.get<string>("coordinator.pageCollection"),
    );
  }

  /**
   * Starts crawling and scraping
   */
  async start() {
    await this.#crawler.init();

    console.log(`Processing page: ${this.#instructions.startAddress}`);
    await this.#processAddress(this.#instructions.startAddress, true);

    while ((await this.#countPagesToVisit()) > 0) {
      console.log(`Starting to process new batch of ${this.#tabCount} pages`);

      await wait(this.#delayTimer);

      const promises: Promise<void>[] = [];

      for (let i = 0; i < this.#tabCount; i++) {
        promises.push(
          this.#initializeAddressProcessing(await this.#getPageToVisit()),
        );
      }

      await Promise.allSettled(promises);
    }

    console.log(`Finished processing. Closing browser`);

    await this.#crawler.closeBrowser();
  }

  async #countPagesToVisit() {
    return this.#pageCollection.countDocuments({
      status: PageStatus.Pending,
    });
  }

  async #getPageToVisit() {
    const result = await this.#pageCollection.findOneAndUpdate(
      {
        status: PageStatus.Pending,
      },
      { $set: { status: PageStatus.Processing, startedAt: new Date() } },
    );

    return result.value?.link;
  }

  async #initializeAddressProcessing(address: string | undefined) {
    if (!address) {
      console.log(`Empty or nonexistant page. Skipping`);
      return;
    }

    console.log(`Starting to process page: ${address}`);

    await this.#processAddress(address);

    console.log(`Finished processing page ${address}`);
  }

  /**
   * Processes an address:
   *  - opening
   *  - collects new pages to visit
   *  - collects products
   *
   */
  async #processAddress(address: string, isFirstPage = false) {
    const page = await this.#crawler.gotoAddress(address);

    if (isFirstPage) {
      await this.#processLinks(page, this.#instructions.clickOnce);
    }

    await this.#processLinks(page, this.#instructions.click);

    const { container, metadata } = this.#instructions.item;
    const newProducts = await this.#crawler.getElements(
      page,
      container,
      metadata,
    );

    console.log(`Discovered ${JSON.stringify(newProducts)} products.`);

    await this.#outputWriter.write(address, newProducts);

    await this.#crawler.closePage(page);

    await this.#pageCollection.updateOne(
      {
        link: address,
      },
      {
        $set: {
          status: PageStatus.Done,
          finishedAt: new Date(),
        },
      },
    );
  }

  async #processLinks(page: Page, linkInstructions: InstructionStep) {
    const { container, metadata } = linkInstructions;
    const newPagesToVisit = await this.#crawler.getElements(
      page,
      container,
      metadata,
    );

    console.log(
      `Discovered ${JSON.stringify(newPagesToVisit)} pages to visit.`,
    );

    await this.#pageCollection.insertMany(
      newPagesToVisit.map((i) => ({
        link: i.link,
        status: PageStatus.Pending,
        discoveredAt: new Date(),
      })),
      { ordered: false }, // ignore duplicates
    );
  }
}
