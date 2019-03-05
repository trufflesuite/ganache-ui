import path from "path";
import fse from "fs-extra";
import Workspace from "./Workspace";
import WorkspaceSettings from "../settings/WorkspaceSettings";

class WorkspaceManager {
  constructor(directory) {
    this.directory = directory;
    this.workspaces = [];
  }

  enumerateWorkspaces() {
    const workspacesDirectory = path.join(this.directory, "workspaces");
    if (fse.existsSync(workspacesDirectory)) {
      this.workspaces = fse
        .readdirSync(workspacesDirectory)
        .filter(file => {
          return fse.lstatSync(path.join(workspacesDirectory, file))
            .isDirectory;
        })
        .map(file => {
          let settings = new WorkspaceSettings(
            path.join(workspacesDirectory, file),
            path.join(workspacesDirectory, file, "chaindata"),
          );
          settings.bootstrap();
          const name = settings.get("name");
          const sanitizedName = Workspace.getSanitizedName(name);
          if (sanitizedName !== file) {
            // apparently the Settings file has a name that is not equal to the directory,
            //   we need to move the directory
            fse.moveSync(
              path.join(workspacesDirectory, file),
              path.join(workspacesDirectory, sanitizedName),
            );
          }
          return new Workspace(name, this.directory);
        });
    }

    this.workspaces.push(new Workspace(null, this.directory));
  }

  bootstrap() {
    this.enumerateWorkspaces();
    for (let i = 0; i < this.workspaces.length; i++) {
      this.workspaces[i].bootstrap();
    }
  }

  getNonDefaultNames() {
    return this.workspaces
      .filter(workspace => workspace.name !== null)
      .map(workspace => workspace.name);
  }

  get(name) {
    return this.workspaces.find(workspace => name === workspace.name);
  }
}

export default WorkspaceManager;
