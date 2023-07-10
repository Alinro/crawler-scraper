import ConsoleWriter from "./ConsoleWriter";
import DatabaseWriter from "./DatabaseWriter";
import HtmlWriter from "./HtmlWriter";
import { AbstractWriter } from "./types";

const ALLOWED_WRITERS = ["console", "html", "database"] as const;
type ALLOWED_WRITERS = (typeof ALLOWED_WRITERS)[number];

const mapping: Record<ALLOWED_WRITERS, () => AbstractWriter> = {
  console: () => new ConsoleWriter(),
  html: () => new HtmlWriter(),
  database: () => new DatabaseWriter(),
};

const isAllowedWriter = (type: string): type is ALLOWED_WRITERS => {
  return ALLOWED_WRITERS.includes(type as ALLOWED_WRITERS);
};

export const getOutputWriterInstance = (type: string): AbstractWriter => {
  if (!isAllowedWriter(type)) {
    throw Error(`Output writer with type ${type} does not exist`);
  }

  return mapping[type]();
};
