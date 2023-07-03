import { Elements, WriterInterface } from "./types";

export default class ConsoleWriter implements WriterInterface {
  write(elements: Elements) {
    if (elements.length === 0) {
      return;
    }

    console.log("Starting writing to console");

    elements.forEach((element) => {
      let output = "";

      for (const [key, value] of Object.entries(element)) {
        output += `${key}: ${value} | `;
      }

      console.log(output);
    });
  }
}
