import config from "config";
import type { Db, Document } from "mongodb";
import { MongoClient } from "mongodb";

class DatabaseManager {
  #client: MongoClient | undefined;
  #db: Db | undefined;

  async connect() {
    const { connectionString, database } = config.get<{
      connectionString: string;
      database: string;
      collection: string;
    }>("database");

    this.#client = await MongoClient.connect(connectionString);
    this.#db = this.#client.db(database);
  }

  collection<TSchema extends Document = Document>(collection: string) {
    if (!this.#db) {
      throw Error("Database not connected");
    }

    return this.#db.collection<TSchema>(collection);
  }

  async close() {
    await this.#client?.close();
  }
}

export const databaseManager = new DatabaseManager();
