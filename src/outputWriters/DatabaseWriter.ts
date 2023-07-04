import { Collection, MongoClient } from "mongodb";
import { AbstractWriter } from "./types";

export default class DatabaseWriter extends AbstractWriter {
  #client: MongoClient | undefined;
  #col: Collection | undefined;

  async init() {
    try {
      this.#client = await MongoClient.connect("mongodb://localhost");
      const db = this.#client.db("testing");
      this.#col = db.collection("test-col");
    } catch (ex) {
      console.log(ex);
    }
  }

  async write(elements: Record<string, string>[]) {
    if (elements.length === 0) {
      return;
    }

    if (!this.#col) {
      await this.init();
    }

    try {
      await this.#col?.insertMany(elements);
    } catch (ex) {
      console.log(ex);
    }
  }

  async close() {
    await this.#client?.close();
  }
}
