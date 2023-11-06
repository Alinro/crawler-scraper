import config from "config";
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";

import type { ContainerConfig, MetadataConfig } from "../instructions/types";
import type { Elements } from "../outputWriters/types";
import type { CrawlerInterface } from "./types";

export default class PuppeteerCrawler implements CrawlerInterface<Page> {
  /**
   * @var {puppeteer.Browser} browser a reference to the browser instance that puppeteer launched
   */
  #browser: Browser | undefined;

  async init() {
    if (!this.#browser) {
      this.#browser = await puppeteer.launch(config.get("puppeteer"));
    }
  }

  setListeners(onAddressFinished: () => void, onUnexpectedStop: () => void) {
    if (!this.#browser) {
      throw new Error(
        "Please initialize the crawler instance before setting listeners",
      );
    }

    this.#browser.on("targetdestroyed", () => {
      onAddressFinished();
    });

    this.#browser.on("disconnected", () => {
      onUnexpectedStop();
    });
  }

  /**
   * Navigate to the specified address in the current tab
   *
   * @param {string} address
   */
  async gotoAddress(address: string) {
    if (!this.#browser) {
      throw new Error(
        "Please initialize the browser instance before navigating to an address",
      );
    }

    const page = await this.#browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.goto(address);

    return page;
  }

  async getElements(
    page: Page,
    containerConfig: ContainerConfig,
    metadataConfig: MetadataConfig,
  ): Promise<Elements> {
    return page.evaluate(
      (containerConfig, metadataConfig) => {
        const containers = document.querySelectorAll(containerConfig.selector);

        const metadata: Record<string, string>[] = [];

        containers.forEach((container) => {
          const element: Record<string, string> = {};

          for (const [key, { property, selector }] of Object.entries(
            metadataConfig,
          )) {
            if (selector) {
              const htmlElement = container.querySelector(selector);
              if (!htmlElement) {
                console.warn(
                  `Can't find ${selector} in container ${containerConfig.selector}`,
                );
                continue;
              }

              element[key] = String(htmlElement[property]) || "";
            } else {
              element[key] = String(container[property]) || "";
            }
          }

          if (Object.keys(element).length !== 0) {
            metadata.push(element);
          }
        });

        return metadata;
      },
      containerConfig,
      metadataConfig,
    );
  }

  /**
   * Stops puppeteer by closing the browser
   */
  async closeBrowser() {
    await this.#browser?.close();
  }

  /**
   * Close puppeteer page
   */
  async closePage(page: Page) {
    await page.close();
  }

  async isProcessing() {
    const pages = await this.#browser?.pages();
    return pages?.length !== 0;
  }
}
