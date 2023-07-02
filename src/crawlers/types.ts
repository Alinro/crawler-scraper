import { ContainerConfig, MetadataConfig } from "../instructions/types.js";
import { Elements } from "../outputWriters/types.js";

export interface CrawlerInterface {
  gotoAddress: (address: string) => void;
  getElements: (
    containerConfig: ContainerConfig,
    metadataConfig: MetadataConfig
  ) => Promise<Elements>;
  close: () => void;
}
