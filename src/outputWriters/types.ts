export type Elements = Record<string, string>[];

export interface WriterInterface {
  write: (elements: Elements) => void;
}
