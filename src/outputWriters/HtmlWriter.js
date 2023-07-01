import fs from "fs";
import WriterInterface from "./WriterInterface.js";
import config from "config";

export default class HtmlWriter extends WriterInterface {
  write(elements) {
    if (elements.length === 0) {
      return;
    }

    console.log(`Starting writing to html file ${config.htmlWriter.file}`);

    this.writeStream = fs.createWriteStream(config.htmlWriter.file, {
      flags: "a",
    });

    let output = "";

    output += this.#getTableHeader(elements);
    output += this.#getTableContent(elements);

    this.writeStream.write(output);
    this.writeStream.end();
  }

  #getTableHeader(elements) {
    const fileExists = fs.existsSync(config.htmlWriter.file);

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

  #getTableContent(elements) {
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
