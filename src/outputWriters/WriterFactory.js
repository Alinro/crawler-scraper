import ConsoleWriter from "./ConsoleWriter.js";
import HtmlWriter from "./HtmlWriter.js";

const mapping = {
  console: ConsoleWriter,
  html: HtmlWriter,
};

export const getOutputWriterInstance = (type) => {
  if (!mapping[type]) {
    throw `Output writer with type ${type} does not exist`;
  }

  return new mapping[type]();
};
