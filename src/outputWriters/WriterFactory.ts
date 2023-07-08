import config from "config";
import ConsoleWriter from "./ConsoleWriter";
import DatabaseWriter from "./DatabaseWriter";
import HtmlWriter from "./HtmlWriter";
import { AbstractWriter } from "./types";
import { MongoClient } from "mongodb";

const mapping: Record<string, () => Promise<AbstractWriter>> = {
  console: async () => new ConsoleWriter(),
  html: async () => new HtmlWriter(),
  database: async () => {
    const { connectionString, database, collection } = config.get<{
      connectionString: string;
      database: string;
      collection: string;
    }>("writer.database");

    const client = await MongoClient.connect(connectionString);
    const db = client.db(database);

    return new DatabaseWriter(client, db.collection(collection));
  },
};

export const getOutputWriterInstance = async (
  type: string
): Promise<AbstractWriter> => {
  if (!mapping[type]) {
    throw `Output writer with type ${type} does not exist`;
  }

  return await mapping[type]();
};
