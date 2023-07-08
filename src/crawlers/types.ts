import { Page } from "puppeteer";
import { ContainerConfig, MetadataConfig } from "../instructions/types";
import { Elements } from "../outputWriters/types";

export interface CrawlerInterface {
  init: () => Promise<void>;

  gotoAddress: (address: string) => Promise<Page>;

  getElements: (
    page: Page,
    containerConfig: ContainerConfig,
    metadataConfig: MetadataConfig,
  ) => Promise<Elements>;

  closeBrowser: () => Promise<void>;

  closePage: (page: Page) => Promise<void>;
}
