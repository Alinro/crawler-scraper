import { Page } from "puppeteer";
import { CrawlerInterface } from "./crawlers/types";
import { InstructionStep, Instructions } from "./instructions/types";
import { AbstractWriter } from "./outputWriters/types";
import { wait } from "./utils";

import config from "config";

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

  /**
   * @var {Set} pagesAlreadyVisited a set of pages that we already visited (so we don't visit the same page multiple times)
   */
  #pagesAlreadyVisited = new Set();

  /**
   * @var {Array} pagesToVisit a collection of pages that are going to be visited
   */
  #pagesToVisit: string[] = [];

  #tabCount: number = 1;

  constructor(
    crawler: CrawlerInterface,
    outputWriter: AbstractWriter,
    instructions: Instructions
  ) {
    this.#crawler = crawler;
    this.#instructions = instructions;
    this.#outputWriter = outputWriter;

    this.#delayTimer = config.get<number>("delay");
    this.#tabCount = config.get<number>("tabCount");
  }

  /**
   * Starts crawling and scraping
   */
  async start() {
    await this.#crawler.init();

    console.log(`Processing page: ${this.#instructions.startAddress}`);
    await this.#processAddress(this.#instructions.startAddress, true);

    while (this.#pagesToVisit.length > 0) {
      await wait(this.#delayTimer);

      const promises: Promise<void>[] = [];

      for (let i = 0; i < this.#tabCount; i++) {
        promises.push(
          this.#initializeAddressProcessing(this.#pagesToVisit.pop())
        );
      }

      await Promise.allSettled(promises);

      console.log(`${this.#pagesToVisit.length} pages remaining`);
    }

    console.log(`Finished processing. Closing browser`);

    await this.#crawler.closeBrowser();
    await this.#outputWriter.close();
  }

  async #initializeAddressProcessing(address: string | undefined) {
    if (!address) {
      console.log(`Empty or nonexistant page. Skipping`);
      return;
    }

    if (this.#pagesAlreadyVisited.has(address)) {
      console.log(`Duplicate page: ${address}. Skipping`);
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
    this.#pagesAlreadyVisited.add(address);
    const page = await this.#crawler.gotoAddress(address);

    if (isFirstPage) {
      this.#processLinks(page, this.#instructions.clickOnce);
    }

    this.#processLinks(page, this.#instructions.click);

    const { container, metadata } = this.#instructions.item;
    const newProducts = await this.#crawler.getElements(
      page,
      container,
      metadata
    );

    console.log(`Discovered ${JSON.stringify(newProducts)} products.`);
    await this.#outputWriter.write(address, newProducts);

    this.#crawler.closePage(page);
  }

  async #processLinks(page: Page, linkInstructions: InstructionStep) {
    const { container, metadata } = linkInstructions;
    const newPagesToVisit = await this.#crawler.getElements(
      page,
      container,
      metadata
    );

    console.log(
      `Discovered ${JSON.stringify(newPagesToVisit)} pages to visit.`
    );

    newPagesToVisit.forEach((page) => {
      this.#pagesToVisit.push(page.link);
    }, this);
  }
}
