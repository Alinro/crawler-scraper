import ScrapingCoordinator from "./ScrapingCoordinator";
import PuppeteerCrawler from "./crawlers/PuppeteerCrawler";
import { getInstructions } from "./instructions/index";
import { getOutputWriterInstance } from "./outputWriters/WriterFactory";

import config from "config";
import type { Page } from "puppeteer";
import { databaseManager } from "./DatabaseManager";

void (async () => {
  try {
    const instructions = getInstructions(config.get("instructionSet"));

    const crawler = new PuppeteerCrawler();
    const outputWriter = getOutputWriterInstance(config.get("outputType"));

    await databaseManager.connect();

    const scrapingCoordinator = new ScrapingCoordinator<Page>(
      crawler,
      outputWriter,
      instructions,
    );

    await scrapingCoordinator.start();
  } catch (ex) {
    console.error(ex);
  } finally {
    await databaseManager.close();
  }
})();
