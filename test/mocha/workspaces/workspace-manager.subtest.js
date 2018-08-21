import path from "path";
import assert from "assert";

import WorkspaceManager from "../../../src/main/types/workspaces/WorkspaceManager";
import { DEFAULT_WORKSPACE_NAME } from "../../../src/main/types/settings/WorkspaceSettings";

describe("Workspace Manager", () => {
  let workspaceManager = null;

  before(async () => {
    workspaceManager = new WorkspaceManager(path.resolve(__dirname, "test-workspaces"));
  });

  it("boostraps without error", async () => {
    workspaceManager.bootstrap();
  });

  it("loads expected worksapces", async () => {
    let expectedWorkspaces = {
      "Test 1": false,
      "Test 2": false
    };
    expectedWorkspaces[DEFAULT_WORKSPACE_NAME] = false;
    const expectedWorkspaceNames = Object.keys(expectedWorkspaces);
    const numExpectedWorkspaces = expectedWorkspaceNames.length;

    assert(workspaceManager.workspaces.length === numExpectedWorkspaces,
      "Expected " + numExpectedWorkspaces + " workspaces, found " + workspaceManager.workspaces.length + " instead.");

    for (let i = 0; i < workspaceManager.workspaces.length; i++) {
      const name = workspaceManager.workspaces[i].name;
      if (name in expectedWorkspaces) {
        if (expectedWorkspaces[name] === true) {
          throw new Error("Found expected workspace more than once");
        }

        expectedWorkspaces[name] = true;
      }
      else {
        throw new Error("Found unexpected workspace: " + name);
      }
    }

    for (let i = 0; i < numExpectedWorkspaces; i++) {
      const name = expectedWorkspaceNames[i];
      if (expectedWorkspaces[name] === false) {
        throw new Error("Did not find expected workspace: " + name);
      }
    }
  });
});