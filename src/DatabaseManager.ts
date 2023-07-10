import config from "config";
import { Db, MongoClient } from "mongodb";

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

  collection(collection: string) {
    if (!this.#db) {
      throw Error("Database not connected");
    }

    return this.#db.collection(collection);
  }

  async close() {
    await this.#client?.close();
  }
}

export const databaseManager = new DatabaseManager();
