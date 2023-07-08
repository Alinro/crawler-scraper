import config from "config";
import ConsoleWriter from "./ConsoleWriter";
import DatabaseWriter from "./DatabaseWriter";
import HtmlWriter from "./HtmlWriter";
import { AbstractWriter } from "./types";
import { MongoClient } from "mongodb";

const ALLOWED_WRITERS = ["console", "html", "database"] as const;
type ALLOWED_WRITERS = (typeof ALLOWED_WRITERS)[number];

const mapping: Record<
  ALLOWED_WRITERS,
  () => Promise<AbstractWriter> | AbstractWriter
> = {
  console: () => new ConsoleWriter(),
  html: () => new HtmlWriter(),
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

const isAllowedWriter = (type: string): type is ALLOWED_WRITERS => {
  return ALLOWED_WRITERS.includes(type as ALLOWED_WRITERS);
};

export const getOutputWriterInstance = async (
  type: string,
): Promise<AbstractWriter> => {
  if (!isAllowedWriter(type)) {
    throw Error(`Output writer with type ${type} does not exist`);
  }

  return await mapping[type]();
};
