export type Elements = Record<string, string>[];

export abstract class AbstractWriter {
  abstract write(address: string, elements: Elements): Promise<void> | void;

  async close() {
    // do nothing
  }
}
