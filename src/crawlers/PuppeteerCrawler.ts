import puppeteer, { Browser, HTTPResponse, Page } from "puppeteer";
import config from "config";

import { CrawlerInterface } from "./types.js";
import { ContainerConfig, MetadataConfig } from "../instructions/types.js";
import { Elements } from "../outputWriters/types.js";

export default class PuppeteerCrawler implements CrawlerInterface {
  /**
   * @var {puppeteer.Browser} browser a reference to the browser instance that puppeteer launched
   */
  #browser: Browser | undefined;

  /**
   * @var {puppeteer.Page} page a reference to the page tab inside the browser controlled by puppeteer
   */
  #page: Page | undefined;

  /**
   * @var {puppetter.ResponseForRequest} response a reference to the response data for the last page load
   */
  #response: HTTPResponse | null | undefined;

  /**
   * Navigate to the specified address in the current tab
   *
   * @param {string} address
   */
  async gotoAddress(address: string) {
    if (!this.#browser) {
      this.#browser = await puppeteer.launch(config.get("puppeteer"));
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

  async getElements(
    containerConfig: ContainerConfig,
    metadataConfig: MetadataConfig
  ): Promise<Elements> {
    // const hasFunction = await this.#page.evaluate(() => {
    //   return window.nothing;
    // });
    // if (!hasFunction) {
    //   // workaround to force puppeteer to populate the source map so we can debug our code in the browser
    //   this.#page.exposeFunction("nothing", () => null);
    // }

    // debugger;

    return this.#page!.evaluate(
      (containerConfig, metadataConfig) => {
        // debugger;
        const containers = document.querySelectorAll(containerConfig.selector);

        const metadata: Record<string, string>[] = [];

        containers.forEach((container) => {
          const element: Record<string, string> = {};

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

              // TODO: fix as keyof type assertion
              element[key] =
                String(htmlElement[property as keyof Element]) || "";
            } else {
              element[key] = String(container[property as keyof Element]) || "";
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
    this.#browser!.close();
  }
}
