export interface ContainerConfig {
  selector: string;
}

export interface MetadataConfig {
  [key: string]: {
    property: keyof Element;
    selector: string;
  };
}

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
