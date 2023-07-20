import config from "config";
import { MongoClient } from "mongodb";
import { PageStatus, PageToVisitSchema } from "../src/types";

void (async () => {
  const { connectionString, database } = config.get<{
    connectionString: string;
    database: string;
    collection: string;
  }>("database");

  const client = await MongoClient.connect(connectionString);
  const db = client.db(database);
  const collection = db.collection<PageToVisitSchema>(
    config.get<string>("coordinator.pageCollection"),
  );
  const result = await collection
    .find({
      status: PageStatus.Processing,
    })
    .toArray();

  console.log(result.map((r) => r.link));

  process.exit(0);
})();
