
import Workspace from "../../../src/main/types/workspaces/Workspace";
import temp from "temp";
import assert from "assert";
import fs from "fs";
import path from "path";
import isEqual from "lodash.isequal";

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
    assert(fs.existsSync(workspace.workspaceDirectory), "Workspace directory wasn't created");
    const settingsFile = path.join(workspace.workspaceDirectory, "Settings");
    assert(fs.existsSync(settingsFile), "Workspace Settings file wasn't created");
    const settings = JSON.parse(fs.readFileSync(settingsFile));
    const workspaceSettings = workspace.settings._getAllRaw();
    assert(isEqual(workspaceSettings, settings), "The settings in the workspace don't match what's in the Settings file");
  });
});