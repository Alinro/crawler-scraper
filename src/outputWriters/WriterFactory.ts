import ConsoleWriter from "./ConsoleWriter.js";
import HtmlWriter from "./HtmlWriter.js";
import { WriterInterface } from "./types.js";

// TODO: fix any
const mapping: Record<string, any> = {
  console: ConsoleWriter,
  html: HtmlWriter,
};

export const getOutputWriterInstance = (type: string): WriterInterface => {
  if (!mapping[type]) {
    throw `Output writer with type ${type} does not exist`;
  }

  return new mapping[type]();
};
