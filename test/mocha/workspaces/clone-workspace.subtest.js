import Workspace from "../../../src/main/types/workspaces/Workspace";
import temp from "temp";
import assert from "assert";
import fs from "fs";
import path from "path";
import ganacheLib from "ganache-core";
import Web3 from "web3";

describe("Clone Workspace", () => {
  let configDirectory = "/";
  let workspace;
  let clonedWorkspace;
  const cloneName = "cloned workspace";

  before("create folder where workspace will live", async () => {
    temp.track();
    configDirectory = temp.mkdirSync("ganache-temp-workspaces");
    fs.mkdirSync(path.join(configDirectory, "workspaces"));
  });

  before("created and bootstrapped new workspace", async () => {
    workspace = new Workspace("Temp Workspace", configDirectory);
    workspace.bootstrap();
  });

  it("did not clone workspace into existing directory", async () => {
    clonedWorkspace = workspace.clone(workspace.name);
    assert.strictEqual(
      clonedWorkspace,
      undefined,
      "Workspace was cloned into existing directory",
    );
  });

  it("cloned workspace without error", async () => {
    clonedWorkspace = workspace.clone(cloneName);
    assert(
      fs.existsSync(clonedWorkspace.workspaceDirectory),
      "Cloned workspace directory wasn't created",
    );
    const settingsFile = path.join(
      clonedWorkspace.workspaceDirectory,
      "Settings",
    );
    assert(
      fs.existsSync(settingsFile),
      "Cloned Workspace Settings file wasn't created",
    );
  });

  it("applied correct settings to cloned workspace", async () => {
    assert.notEqual(
      clonedWorkspace.settings.get("uuid"),
      workspace.settings.get("uuid"),
      "The uuid of the cloned workspace should be different from the original",
    );
    assert.equal(
      clonedWorkspace.name,
      cloneName,
      "Cloned workspace should have the correct name set",
    );
    assert.equal(
      clonedWorkspace.settings.get("name"),
      cloneName,
      "Cloned workspace settings should have correct name set",
    );
    assert.notEqual(
      workspace.settings.get("server.db_path"),
      clonedWorkspace.settings.get("server.db_path"),
      "Cloned workspace db_path is the same like original workspace",
    );
    assert.equal(
      clonedWorkspace.settings.get("server.db_path"),
      path.join(clonedWorkspace.workspaceDirectory, "chaindata"),
      "Cloned workspace db_path is not correct",
    );
    assert.equal(
      clonedWorkspace.settings.get("server.mnemonic"),
      workspace.settings.get("server.mnemonic"),
      "Mnemeonic of cloned workspace is different from original",
    );
  });

  it("started and stopped cloned workspace with no errors", done => {
    var web3 = new Web3();
    web3.setProvider(ganacheLib.provider(clonedWorkspace.settings.getAll()));

    web3.eth.getAccounts(function(err, result) {
      if (err) return done(err);
      assert(
        result.length,
        10,
        "The number of accounts created should be 10 (the default)",
      );
      done();
    });
  });
});
