import sinon, { SinonSpy } from "sinon";
import assert from "assert";
import ConsoleWriter from "./ConsoleWriter.js";

describe("ConsoleWriter", function () {
  let consoleWriter: ConsoleWriter, spy: SinonSpy;

  beforeEach(function () {
    consoleWriter = new ConsoleWriter();
    spy = sinon.spy(console, "log");
  });

  this.afterEach(function () {
    spy.restore();
  });

  describe("write", function () {
    it("should not log anything when receiving an empty array", () => {
      consoleWriter.write([]);
      assert(spy.notCalled);
    });

    it("should log correct information", () => {
      consoleWriter.write([
        { key1: "value1", key2: "value2" },
        { key3: "value3", key4: "value4" },
      ]);

      assert(spy.callCount, "3");
      assert(spy.getCall(0), "Starting writing to console");
      assert(spy.getCall(1), "key1: value1 | key2: value2 |");
      assert(spy.getCall(2), "key3: value3 | key4: value4 |");
    });
  });
});
