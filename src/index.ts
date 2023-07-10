import PuppeteerCrawler from "./crawlers/PuppeteerCrawler";
import ScrapingCoordinator from "./ScrapingCoordinator";
import { getOutputWriterInstance } from "./outputWriters/WriterFactory";
import { getInstructions } from "./instructions/index";

import config from "config";
import { databaseManager } from "./DatabaseManager";

void (async () => {
  try {
    const instructions = getInstructions(config.get("instructionSet"));

    const crawler = new PuppeteerCrawler();
    const outputWriter = getOutputWriterInstance(config.get("outputType"));

    await databaseManager.connect();

    const scrapingCoordinator = new ScrapingCoordinator(
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
