import DatabaseWriter from "./DatabaseWriter";
import { MongoMemoryServer } from "mongodb-memory-server";
import config from "config";
import { Collection, MongoClient } from "mongodb";

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
    const writer = new DatabaseWriter(client, collection);
    await writer.write("test", [{ key1: "value1", key2: "value2" }]);

    expect(await collection.findOne()).toEqual({
      _id: expect.anything(),
      address: "test",
      metadata: [{ key1: "value1", key2: "value2" }],
    });
  });

  it("should not write to the database when receiving an empty array", async () => {
    const writer = new DatabaseWriter(client, collection);
    await writer.write("test", []);

    expect(await collection.findOne()).toBeNull();
  });

  it("should write to the database when called multiple times", async () => {
    const writer = new DatabaseWriter(client, collection);

    await writer.write("test", [{ key1: "value1", key2: "value2" }]);
    await writer.write("test", [{ key3: "value3", key4: "value4" }]);
    await writer.write("test", [{ key5: "value5", key6: "value6" }]);

    expect(await collection.find().toArray()).toEqual([
      {
        _id: expect.anything(),
        address: "test",
        metadata: [{ key1: "value1", key2: "value2" }],
      },
      {
        _id: expect.anything(),
        address: "test",
        metadata: [{ key3: "value3", key4: "value4" }],
      },
      {
        _id: expect.anything(),
        address: "test",
        metadata: [{ key5: "value5", key6: "value6" }],
      },
    ]);
  });

  it("should not write to the database when called multiple times with empty arrays", async () => {
    const writer = new DatabaseWriter(client, collection);

    await writer.write("test", []);
    await writer.write("test", []);
    await writer.write("test", []);

    expect(await collection.find().toArray()).toEqual([]);
  });
});
