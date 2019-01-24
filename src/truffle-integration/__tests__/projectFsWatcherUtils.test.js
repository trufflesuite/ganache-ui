import assert from "assert";
import { getAncestorDirs } from "../projectFsWatcherUtils";

describe("projectFsWatcherUtils", () => {
  describe("getAncestorDirs", () => {
    const truffle_directory = "/path/to/awesome/project";

    it("returns a list of all ancestor dirs up to truffle_directory when contracts_build_directory is a child of truffle_directory", () => {
      const contracts_build_directory = `${truffle_directory}/contracts`;
      const dirs = getAncestorDirs(
        truffle_directory,
        contracts_build_directory,
      );

      assert.deepEqual(dirs, [truffle_directory]);
    });

    it("returns a list of all ancestor dirs up to truffle_directory when contracts_build_directory is a descendant of truffle_directory", () => {
      const contracts_build_directory = `${truffle_directory}/build/contracts`;
      const dirs = getAncestorDirs(
        truffle_directory,
        contracts_build_directory,
      );

      assert.deepEqual(dirs, [truffle_directory, `${truffle_directory}/build`]);
    });

    it("returns a list of all ancestor dirs when contracts_build_directory is not a descendent of truffle_directory", () => {
      const contracts_build_directory = `/path/to/build/contracts`;
      const dirs = getAncestorDirs(
        truffle_directory,
        contracts_build_directory,
      );

      assert.deepEqual(dirs, ["/", "/path", "/path/to", "/path/to/build"]);
    });
  });
});
