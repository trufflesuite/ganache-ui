const path = require("path");
const assert = require("assert");
import ProjectDetailsFile from "../../../static/node/truffle-integration/projectDetails";

describe("Project Loader", () => {
  it("shouldn't crash when loading a truffle config", async () => {
    const config = await ProjectDetailsFile.get(
      path.join(__dirname, "./truffle-project/truffle.js"),
    );

    assert.strictEqual(
      config.error,
      undefined,
      "A Truffle config with circular json and a relative `file.read` call shouldn't return an error",
    );

    // we specified a build directory of "./123" in our truffle.js
    assert.strictEqual(
      config.config.build_directory,
      path.join(__dirname, "truffle-project", "123"),
    );
    assert.ok(
      config.config.contracts_build_directory,
      path.join(__dirname, "truffle-project", "123", "contracts"),
    );
    assert.ok(
      config.config.truffle_directory,
      path.join(__dirname, "truffle-project"),
    );
  });

  it("shouldn't crash when loading a truffle config doesn't exist", async () => {
    const configPath = path.join(__dirname, "./truffle.js");
    const config = await ProjectDetailsFile.get(configPath);
    assert.equal(config.error, "project-does-not-exist");
    assert.equal(config.configFile, configPath);
    assert.ok(Array.isArray(config.contracts));
    assert.equal(config.contracts.length, 0);
    const configFileDirectory = path.dirname(configPath);
    const name = path.basename(configFileDirectory);
    assert.equal(config.name, name);
  });

  it("shouldn't crash when loading a truffle config from a directory that doesn't exist", async () => {
    const configPath = path.join(__dirname, "./doesn't-exist/truffle.js");
    const config = await ProjectDetailsFile.get(configPath);
    assert.equal(config.error, "project-directory-does-not-exist");
    assert.equal(config.configFile, configPath);
    assert.ok(Array.isArray(config.contracts));
    assert.equal(config.contracts.length, 0);
    const configFileDirectory = path.dirname(configPath);
    const name = path.basename(configFileDirectory);
    assert.equal(config.name, name);
  });
});
