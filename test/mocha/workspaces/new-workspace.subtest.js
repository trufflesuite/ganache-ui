import Workspace from "../../../src/main/types/workspaces/Workspace";
import temp from "temp";
import assert from "assert";
import fs from "fs";
import path from "path";
import isEqual from "lodash.isequal";
import ganacheLib from "ganache-core";
import Web3 from "web3";

describe("New Workspace", () => {
  let configDirectory = "/";
  let workspace;

  before("create folder where workspace will live", async () => {
    temp.track();
    configDirectory = temp.mkdirSync("ganache-temp-workspaces");
    fs.mkdirSync(path.join(configDirectory, "workspaces"));
  });

  it("created and bootstrapped new workspace", async () => {
    workspace = new Workspace("Temp Workspace", configDirectory);
    workspace.bootstrap();
  });

  it("created expected settings files", async () => {
    assert(
      fs.existsSync(workspace.workspaceDirectory),
      "Workspace directory wasn't created",
    );
    const settingsFile = path.join(workspace.workspaceDirectory, "Settings");
    assert(
      fs.existsSync(settingsFile),
      "Workspace Settings file wasn't created",
    );
    const settings = JSON.parse(fs.readFileSync(settingsFile));
    const workspaceSettings = workspace.settings._getAllRaw();
    assert(
      isEqual(workspaceSettings, settings),
      "The settings in the workspace don't match what's in the Settings file",
    );
  });

  it("started and stopped ganache provider with no errors", done => {
    var web3 = new Web3();
    web3.setProvider(ganacheLib.provider(workspace.settings.getAll()));

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
