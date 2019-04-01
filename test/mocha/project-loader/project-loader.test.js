const path = require("path");
const assert = require("assert");
/* eslint-disable no-console */
import ProjectDetailsFile from "../../../src/truffle-integration/projectDetails";

describe("Project Loader", () => {
  it("shouldn't crash when loading a truffle config with circular json", async () => {
    const config = await ProjectDetailsFile.get(
      path.join(__dirname, "./truffle.js"),
    );

    // we specified a build directory of "./123" in our truffle.js
    assert.strictEqual(
      config.config.build_directory,
      path.join(__dirname, "123"),
    );
    assert.ok(
      config.config.contracts_build_directory,
      path.join(__dirname, "123", "contracts"),
    );
    assert.ok(config.config.truffle_directory, __dirname);
  });

  it("shouldn't crash when loading a truffle config doesn't exist", async () => {
    const configPath = path.join(__dirname, "./not-truffle.js");
    const config = await ProjectDetailsFile.get(configPath);
    assert.equal(config.error, "project-does-not-exist");
    assert.equal(config.configFile, configPath);
    assert.ok(Array.isArray(config.contracts));
    assert.equal(config.contracts.length, 0);
    const configFileDirectory = path.dirname(configPath);
    const name = path.basename(configFileDirectory);
    assert.equal(config.name, name);
  });
});
