import config from "config";
import type { Collection } from "mongodb";
import { databaseManager } from "./DatabaseManager";
import type { CrawlerInterface } from "./crawlers/types";
import type { InstructionStep, Instructions } from "./instructions/types";
import type { AbstractWriter } from "./outputWriters/types";
import type { PageToVisitSchema } from "./types";
import { PageStatus } from "./types";

export default class ScrapingCoordinator<T> {
  /**
   * @var {CrawlerInterface} crawler a class that interacts with the page and its content
   */
  #crawler: CrawlerInterface<T>;

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
    crawler: CrawlerInterface<T>,
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

    return new Promise<void>((resolve) => {
      const onPageClose = async () => {
        const pageToVisit = await this.#getPageToVisit();

        // if nothing is processing and there are no more pages to visit, we're done
        // TODO there might be a potential race condition here, which should be investigated
        if (!pageToVisit && !(await this.#crawler.isProcessing())) {
          console.log("Finished all pages. Closing browser");
          resolve();
          return;
        }

        // await this.#initializeAddressProcessing(pageToVisit);
      };

      const onBrowserError = () => {
        console.error("Browser unexpectedly disconnected");
        resolve();
      };

      this.#crawler.setListeners(onPageClose, onBrowserError);

      console.log(`Processing page: ${this.#instructions.startAddress}`);

      void this.#processAddress(this.#instructions.startAddress, true);

      for (let i = 0; i < this.#tabCount; i++) {
        void this.#initializeAddressProcessing();
      }
    });
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

  async #initializeAddressProcessing() {
    const address = await this.#getPageToVisit();

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

  async #processLinks(page: T, linkInstructions: InstructionStep) {
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
