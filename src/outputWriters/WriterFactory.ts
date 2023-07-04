import ConsoleWriter from "./ConsoleWriter";
import DatabaseWriter from "./DatabaseWriter";
import HtmlWriter from "./HtmlWriter";
import { AbstractWriter } from "./types";

// workaround to not deal with TS types
const mapping: Record<string, () => AbstractWriter> = {
  console: () => new ConsoleWriter(),
  html: () => new HtmlWriter(),
  database: () => new DatabaseWriter(),
};

export const getOutputWriterInstance = (type: string): AbstractWriter => {
  if (!mapping[type]) {
    throw `Output writer with type ${type} does not exist`;
  }

  return mapping[type]();
};
