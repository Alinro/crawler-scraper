import PuppeteerCrawler from "./crawlers/PuppeteerCrawler";
import ScrapingCoordinator from "./ScrapingCoordinator";
import { getOutputWriterInstance } from "./outputWriters/WriterFactory";
import { getInstructions } from "./instructions/index";

import config from "config";

(async () => {
  const instructions = await getInstructions(config.get("instructionSet"));

  const crawler = new PuppeteerCrawler();
  const outputWriter = getOutputWriterInstance(config.get("outputType"));

  const scrapingCoordinator = new ScrapingCoordinator(
    crawler,
    outputWriter,
    instructions
  );

  await scrapingCoordinator.start();
})();
