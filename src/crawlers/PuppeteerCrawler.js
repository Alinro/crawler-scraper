import puppeteer from "puppeteer";
import config from "config";

import CrawlerInterface from "./CrawlerInterface.js";

export default class PuppeteerCrawler extends CrawlerInterface {
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
      this.#browser = await puppeteer.launch(config.puppeteer);
    }

    if (!this.#page) {
      this.#page = await this.#browser.newPage();
      await this.#page.setViewport({
        width: 1920,
        height: 1080,
      });
    }

    this.#response = await this.#page.goto(address);
  }

  /**
   * Collects the specified elements from the current page
   *
   * @param {object} containerConfig Contains details about identifying the containers
   * @param {object} metadataConfig Contains details about identifying the elements belonging to the container
   * @returns
   */
  async getElements(containerConfig, metadataConfig) {
    // const hasFunction = await this.#page.evaluate(() => {
    //   return window.nothing;
    // });
    // if (!hasFunction) {
    //   // workaround to force puppeteer to populate the source map so we can debug our code in the browser
    //   this.#page.exposeFunction("nothing", () => null);
    // }

    // debugger;

    return this.#page.evaluate(
      (containerConfig, metadataConfig) => {
        debugger;
        const containers = document.querySelectorAll(containerConfig.selector);

        const metadata = [];

        containers.forEach((container) => {
          const element = {};

          for (const [key, { property, selector }] of Object.entries(
            metadataConfig
          )) {
            if (selector) {
              const htmlElement = container.querySelector(selector);
              if (!htmlElement) {
                console.warn(
                  `Can't find ${selector} in container ${containerConfig.selector}`
                );
                continue;
              }

              element[key] = htmlElement[property];
            } else {
              element[key] = container[property];
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
}
