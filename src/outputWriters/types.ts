export type Elements = Record<string, string>[];

export abstract class AbstractWriter {
  abstract write(elements: Elements): Promise<void>;

  async close() {}
}
