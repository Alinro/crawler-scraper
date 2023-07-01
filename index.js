import PuppeteerCrawler from "./src/crawlers/PuppeteerCrawler.js";
import ScrapingCoordinator from "./src/ScrapingCoordinator.js";
import { getOutputWriterInstance } from "./src/outputWriters/WriterFactory.js";
import { getInstructions } from "./instructions/index.js";

import config from "config";

const instructions = getInstructions(config.instructionSet);

const crawler = new PuppeteerCrawler();
const outputWriter = getOutputWriterInstance(config.outputType);

const scrapingCoordinator = new ScrapingCoordinator(
  crawler,
  outputWriter,
  instructions
);

await scrapingCoordinator.start();
