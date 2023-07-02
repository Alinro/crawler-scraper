import PuppeteerCrawler from "./crawlers/PuppeteerCrawler.js";
import ScrapingCoordinator from "./ScrapingCoordinator.js";
import { getOutputWriterInstance } from "./outputWriters/WriterFactory.js";
import { getInstructions } from "./instructions/index.js";

import config from "config";

(async () => {
  const instructions = getInstructions(config.get("instructionSet"));

  const crawler = new PuppeteerCrawler();
  const outputWriter = getOutputWriterInstance(config.get("outputType"));

  const scrapingCoordinator = new ScrapingCoordinator(
    crawler,
    outputWriter,
    instructions
  );

  await scrapingCoordinator.start();
})();
