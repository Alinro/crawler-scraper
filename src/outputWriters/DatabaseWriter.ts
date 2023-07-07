import { Collection, MongoClient } from "mongodb";
import { AbstractWriter } from "./types";
import config from "config";

export default class DatabaseWriter extends AbstractWriter {
  #client: MongoClient | undefined;
  #collection: Collection | undefined;

  async init() {
    const { connectionString, database, collection } = config.get<{
      connectionString: string;
      database: string;
      collection: string;
    }>("writer.database");

    this.#client = await MongoClient.connect(connectionString);
    const db = this.#client.db(database);
    this.#collection = db.collection(collection);
  }

  async write(address: string, elements: Record<string, string>[]) {
    if (elements.length === 0) {
      return;
    }

    if (!this.#collection) {
      await this.init();
    }

    await this.#collection?.insertOne({ address, metadata: elements });
  }

  async close() {
    await this.#client?.close();
  }
}
