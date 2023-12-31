import type { Collection } from "mongodb";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import DatabaseWriter from "./DatabaseWriter";

describe("DatabaseWriter", () => {
  let mongod: MongoMemoryServer, client: MongoClient, collection: Collection;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    client = await MongoClient.connect(uri);
    collection = client.db("test").collection("test");
  });

  afterEach(async () => {
    await mongod.stop();
    await client.close();
  });

  it("should write to the database when called once", async () => {
    const writer = new DatabaseWriter();
    await writer.write("test", [{ key1: "value1", key2: "value2" }]);

    expect(await collection.findOne()).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      _id: expect.anything(),
      address: "test",
      metadata: [{ key1: "value1", key2: "value2" }],
    });
  });

  it("should not write to the database when receiving an empty array", async () => {
    const writer = new DatabaseWriter();
    await writer.write("test", []);

    expect(await collection.findOne()).toBeNull();
  });

  it("should write to the database when called multiple times", async () => {
    const writer = new DatabaseWriter();

    await writer.write("test", [{ key1: "value1", key2: "value2" }]);
    await writer.write("test", [{ key3: "value3", key4: "value4" }]);
    await writer.write("test", [{ key5: "value5", key6: "value6" }]);

    expect(await collection.find().toArray()).toEqual([
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        _id: expect.anything(),
        address: "test",
        metadata: [{ key1: "value1", key2: "value2" }],
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        _id: expect.anything(),
        address: "test",
        metadata: [{ key3: "value3", key4: "value4" }],
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        _id: expect.anything(),
        address: "test",
        metadata: [{ key5: "value5", key6: "value6" }],
      },
    ]);
  });

  it("should not write to the database when called multiple times with empty arrays", async () => {
    const writer = new DatabaseWriter();

    await writer.write("test", []);
    await writer.write("test", []);
    await writer.write("test", []);

    expect(await collection.find().toArray()).toEqual([]);
  });
});
