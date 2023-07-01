import CrawlerInterface from "./crawlers/CrawlerInterface.js";
import WriterInterface from "./outputWriters/WriterInterface.js";
import { wait } from "./utils.js";

import config from "config";

export default class ScrapingCoordinator {
  /**
   * @var {CrawlerInterface} crawler a class that interacts with the page and its content
   */
  #crawler;

  /**
   * @var {WriterInterface} outputWriter a reference to a class that implements the WriterInterface. it handles the output process
   */
  #outputWriter;

  /**
   * @var {number} delayTimer how long to wait before processing the next page
   */
  #delayTimer;

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
  #pagesToVisit = [];

  /**
   *
   * @param {CrawlerInterface} crawler
   * @param {WriterInterface} outputWriter
   * @param {object} instructions
   */
  constructor(crawler, outputWriter, instructions) {
    this.#crawler = crawler;
    this.#instructions = instructions;
    this.#outputWriter = outputWriter;

    this.#delayTimer = config.delay;
  }

  /**
   * Starts crawling and scraping
   */
  async start() {
    console.log(`Processing page: ${this.#instructions.startAddress}`);
    await this.#processPage(this.#instructions.startAddress, true);

    while (this.#pagesToVisit.length > 0) {
      const nextPage = this.#pagesToVisit.pop();

      if (!nextPage) {
        console.log(`Malformed address data. Skipping`);
        continue;
      }

      if (this.#pagesAlreadyVisited.has(nextPage)) {
        console.log(`Duplicate page: ${nextPage}. Skipping`);
        continue;
      }

      await wait(this.#delayTimer);

      console.log(`Starting to process page: ${nextPage}`);

      await this.#processPage(nextPage);

      console.log(`Finished processing page ${nextPage}`);
      console.log(`${this.#pagesToVisit.length} pages remaining`);
    }

    console.log(`Finished processing. Closing browser`);

    await this.#crawler.close();
  }

  /**
   * Processes an address:
   *  - opening
   *  - collects new pages to visit
   *  - collects products
   *
   * @param {string} address
   * @param {boolean} isFirstPage
   */
  async #processPage(address, isFirstPage = false) {
    this.#pagesAlreadyVisited.add(address);
    await this.#crawler.gotoAddress(address);

    if (isFirstPage) {
      this.#processLinks(this.#instructions.clickOnce);
    }

    this.#processLinks(this.#instructions.click);

    const { container, metadata } = this.#instructions.item;
    const newProducts = await this.#crawler.getElements(container, metadata);

    console.log(`Discovered ${JSON.stringify(newProducts)} products.`);
    this.#outputWriter.write(newProducts);
  }

  async #processLinks(linkInstructions) {
    const { container, metadata } = linkInstructions;
    const newPagesToVisit = await this.#crawler.getElements(
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
