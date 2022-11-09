import path from "path";
import assert from "assert";

import WorkspaceManager from "../../../src/main/types/workspaces/WorkspaceManager";

describe("Workspace Manager", () => {
  let workspaceManager = null;

  before(async () => {
    workspaceManager = new WorkspaceManager(
      path.resolve(__dirname, "test-workspaces"),
    );
  });

  it("boostrapped without error", async () => {
    workspaceManager.bootstrap();
  });

  it("loaded expected workspaces", async () => {
    let expectedWorkspaces = {
      "Test 1:ethereum": false,
      "Test 2:ethereum": false,
    };
    // todo: not sure whether this should be: expectedWorkspaces[null] = false; // default workspace
    // see: https://github.com/trufflesuite/ganache-ui/commit/184f3fa554178767b10b13d410d4c66478c9e398
    expectedWorkspaces[null + ":ethereum"] = false; // default ethereum workspace
    const expectedWorkspaceNames = Object.keys(expectedWorkspaces);
    const numExpectedWorkspaces = expectedWorkspaceNames.length;

    assert(
      workspaceManager.workspaces.length === numExpectedWorkspaces,
      "Expected " +
        numExpectedWorkspaces +
        " workspaces, found " +
        workspaceManager.workspaces.length +
        " instead.",
    );

    for (let i = 0; i < workspaceManager.workspaces.length; i++) {
      const name = workspaceManager.workspaces[i].name + ":" + workspaceManager.workspaces[i].flavor;
      if (name in expectedWorkspaces) {
        if (expectedWorkspaces[name] === true) {
          throw new Error("Found expected workspace more than once");
        }

        expectedWorkspaces[name] = true;
      } else {
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
