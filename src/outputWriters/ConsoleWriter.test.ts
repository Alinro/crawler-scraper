import ConsoleWriter from "./ConsoleWriter";

describe("ConsoleWriter", function () {
  let consoleWriter: ConsoleWriter, spy: jest.SpyInstance;

  beforeEach(function () {
    consoleWriter = new ConsoleWriter();
    spy = jest.spyOn(console, "log");
  });

  afterEach(function () {
    jest.restoreAllMocks();
  });

  describe("write", function () {
    it("should not log anything when receiving an empty array", () => {
      consoleWriter.write("", []);
      expect(spy).not.toBeCalled();
    });

    it("should log correct information", () => {
      consoleWriter.write("", [
        { key1: "value1", key2: "value2" },
        { key3: "value3", key4: "value4" },
      ]);

      expect(spy).toBeCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1, "Starting writing to console");
      expect(spy).toHaveBeenNthCalledWith(2, "key1: value1 | key2: value2 | ");
      expect(spy).toHaveBeenNthCalledWith(3, "key3: value3 | key4: value4 | ");
    });

    it("should log correct information when called multiple times", () => {
      consoleWriter.write("", [{ key1: "value1", key2: "value2" }]);
      consoleWriter.write("", [{ key3: "value3", key4: "value4" }]);

      expect(spy).toBeCalledTimes(4);
      expect(spy).toHaveBeenNthCalledWith(1, "Starting writing to console");
      expect(spy).toHaveBeenNthCalledWith(2, "key1: value1 | key2: value2 | ");
      expect(spy).toHaveBeenNthCalledWith(3, "Starting writing to console");
      expect(spy).toHaveBeenNthCalledWith(4, "key3: value3 | key4: value4 | ");
    });

    it("should not log anything when called multiple times with empty arrays", () => {
      consoleWriter.write("", []);
      consoleWriter.write("", []);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
