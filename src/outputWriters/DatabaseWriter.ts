import { AbstractWriter } from "./types";
import { databaseManager } from "../DatabaseManager";
import config from "config";

export default class DatabaseWriter extends AbstractWriter {
  async write(address: string, elements: Record<string, string>[]) {
    if (elements.length === 0) {
      return;
    }

    const collection = config.get<string>("writer.database.collection");

    await databaseManager
      .collection(collection)
      .insertOne({ address, metadata: elements });
  }
}
