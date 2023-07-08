export interface ContainerConfig {
  selector: string;
}

interface MetadataConfigItem {
  property: keyof Element;
  selector: string;
}

export type MetadataConfig = Record<string, MetadataConfigItem>;

export interface InstructionStep {
  container: ContainerConfig;
  metadata: MetadataConfig;
}

export interface Instructions {
  startAddress: string;
  clickOnce: InstructionStep;
  click: InstructionStep;
  item: InstructionStep;
}
