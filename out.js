// src/crawlers/PuppeteerCrawler.ts
import puppeteer from "puppeteer";
import config from "config";
var PuppeteerCrawler = class {
  /**
   * @var {puppeteer.Browser} browser a reference to the browser instance that puppeteer launched
   */
  #browser;
  /**
   * @var {puppeteer.Page} page a reference to the page tab inside the browser controlled by puppeteer
   */
  #page;
  /**
   * @var {puppetter.ResponseForRequest} response a reference to the response data for the last page load
   */
  #response;
  /**
   * Navigate to the specified address in the current tab
   *
   * @param {string} address
   */
  async gotoAddress(address) {
    if (!this.#browser) {
      this.#browser = await puppeteer.launch(config.get("puppeteer"));
    }
    if (!this.#page) {
      this.#page = await this.#browser.newPage();
      await this.#page.setViewport({
        width: 1920,
        height: 1080
      });
    }
    this.#response = await this.#page.goto(address);
  }
  async getElements(containerConfig, metadataConfig) {
    return this.#page.evaluate(
      (containerConfig2, metadataConfig2) => {
        const containers = document.querySelectorAll(containerConfig2.selector);
        const metadata = [];
        containers.forEach((container) => {
          const element = {};
          for (const [key, { property, selector }] of Object.entries(
            metadataConfig2
          )) {
            if (selector) {
              const htmlElement = container.querySelector(selector);
              if (!htmlElement) {
                console.warn(
                  `Can't find ${selector} in container ${containerConfig2.selector}`
                );
                continue;
              }
              element[key] = String(htmlElement[property]) || "";
            } else {
              element[key] = String(container[property]) || "";
            }
          }
          metadata.push(element);
        });
        return metadata;
      },
      containerConfig,
      metadataConfig
    );
  }
  /**
   * Stops puppeteer by closing the browser
   */
  async close() {
    this.#browser.close();
  }
};

// src/utils.ts
var wait = function(ms) {
  return new Promise((res) => setTimeout(res, ms));
};

// src/ScrapingCoordinator.ts
import config2 from "config";
var ScrapingCoordinator = class {
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
  #pagesAlreadyVisited = /* @__PURE__ */ new Set();
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
    this.#delayTimer = config2.get("delay");
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
};

// src/outputWriters/ConsoleWriter.ts
var ConsoleWriter = class {
  write(elements) {
    if (elements.length === 0) {
      return;
    }
    console.log("Starting writing to console");
    elements.forEach((element) => {
      let output = "";
      for (const [key, value] of Object.entries(element)) {
        output += `${key}: ${value} | `;
      }
      console.log(output);
    });
  }
};

// src/outputWriters/HtmlWriter.ts
import fs from "fs";
import config3 from "config";
var HtmlWriter = class {
  write(elements) {
    if (elements.length === 0) {
      return;
    }
    const outputFileName = config3.get("htmlWriter.file");
    console.log(`Starting writing to html file ${outputFileName}`);
    const writeStream = fs.createWriteStream(outputFileName, {
      flags: "a"
    });
    let output = "";
    output += this.#getTableHeader(elements, outputFileName);
    output += this.#getTableContent(elements);
    writeStream.write(output);
    writeStream.end();
  }
  #getTableHeader(elements, outputFileName) {
    const fileExists = fs.existsSync(outputFileName);
    if (fileExists) {
      return "";
    }
    let output = "<table><tr>";
    Object.keys(elements[0]).forEach((key) => {
      output += `<th>${key}</th>`;
    });
    output += "</tr>";
    return output;
  }
  #getTableContent(elements) {
    let output = "";
    elements.forEach((element) => {
      output += "<tr>";
      Object.values(element).forEach((value) => {
        output += `<td>${value}</td>`;
      });
      output += "</tr>\n";
    });
    return output;
  }
};

// src/outputWriters/WriterFactory.ts
var mapping = {
  console: ConsoleWriter,
  html: HtmlWriter
};
var getOutputWriterInstance = (type) => {
  if (!mapping[type]) {
    throw `Output writer with type ${type} does not exist`;
  }
  return new mapping[type]();
};

// src/instructions/index.ts
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs2 from "fs";
var mapping2 = {
  oda: "./oda.json",
  finn: "./finn.json",
  test: "./test.json"
};
var getInstructions = (name) => {
  if (!mapping2[name]) {
    throw `Instructions for ${name} not found`;
  }
  const file = fileURLToPath(import.meta.url);
  const directory = dirname(file);
  const path = join(directory, mapping2[name]);
  const fileContent = fs2.readFileSync(path, "utf-8");
  return JSON.parse(fileContent);
};

// src/index.ts
import config4 from "config";
(async () => {
  const instructions = getInstructions(config4.get("instructionSet"));
  const crawler = new PuppeteerCrawler();
  const outputWriter = getOutputWriterInstance(config4.get("outputType"));
  const scrapingCoordinator = new ScrapingCoordinator(
    crawler,
    outputWriter,
    instructions
  );
  await scrapingCoordinator.start();
})();
