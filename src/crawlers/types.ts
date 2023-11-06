import type { ContainerConfig, MetadataConfig } from "../instructions/types";
import type { Elements } from "../outputWriters/types";

export interface CrawlerInterface<T> {
  init: () => Promise<void>;

  setListeners: (
    onAddressFinished: () => void | Promise<void>,
    onUnexpectedStop: () => void | Promise<void>,
  ) => void;

  gotoAddress: (address: string) => Promise<T>;

  getElements: (
    page: T,
    containerConfig: ContainerConfig,
    metadataConfig: MetadataConfig,
  ) => Promise<Elements>;

  closeBrowser: () => Promise<void>;

  closePage: (page: T) => Promise<void>;

  isProcessing(): Promise<boolean>;
}
