import fs from "fs";
import { Elements, WriterInterface } from "./types.js";
import config from "config";

export default class HtmlWriter implements WriterInterface {
  write(elements: Record<string, string>[]) {
    if (elements.length === 0) {
      return;
    }

    const outputFileName = config.get<string>("htmlWriter.file");

    console.log(`Starting writing to html file ${outputFileName}`);

    const writeStream = fs.createWriteStream(outputFileName, {
      flags: "a",
    });

    let output = "";

    output += this.#getTableHeader(elements, outputFileName);
    output += this.#getTableContent(elements);

    writeStream.write(output);
    writeStream.end();
  }

  #getTableHeader(elements: Elements, outputFileName: string) {
    const fileExists = fs.existsSync(outputFileName);

    if (fileExists) {
      return "";
    }

    let output = "<table><tr>";
    Object.keys(elements[0]).forEach((key) => {
      output += `<th>${key}</th>`;
    });
    output += "</tr>";

    return output;
  }

  #getTableContent(elements: Elements) {
    let output = "";

    elements.forEach((element) => {
      output += "<tr>";

      Object.values(element).forEach((value) => {
        output += `<td>${value}</td>`;
      });

      output += "</tr>\n";
    });

    return output;
  }
}
