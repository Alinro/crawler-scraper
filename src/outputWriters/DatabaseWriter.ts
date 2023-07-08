import { Collection, MongoClient } from "mongodb";
import { AbstractWriter } from "./types";
import config from "config";

export default class DatabaseWriter extends AbstractWriter {
  #client: MongoClient;
  #collection: Collection;

  constructor(client: MongoClient, collection: Collection) {
    super();

    this.#client = client;
    this.#collection = collection;
  }

  async write(address: string, elements: Record<string, string>[]) {
    if (elements.length === 0) {
      return;
    }

    await this.#collection.insertOne({ address, metadata: elements });
  }

  async close() {
    await this.#client.close();
  }
}
