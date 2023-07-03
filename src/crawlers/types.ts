import { ContainerConfig, MetadataConfig } from "../instructions/types";
import { Elements } from "../outputWriters/types";

export interface CrawlerInterface {
  gotoAddress: (address: string) => void;
  getElements: (
    containerConfig: ContainerConfig,
    metadataConfig: MetadataConfig
  ) => Promise<Elements>;
  close: () => void;
}
