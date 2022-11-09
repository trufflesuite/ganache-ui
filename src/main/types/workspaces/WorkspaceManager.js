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
      this.workspaces = fse.readdirSync(workspacesDirectory).flatMap((file) => {
        // if an osx user navigates to the workspaces directory osx will put a
        // .DS_Store folder there, ignore and delete these. If the file isn't
        // a directory, also delete it.
        if (
          file === ".DS_Store" ||
          !fse.lstatSync(path.join(workspacesDirectory, file)).isDirectory()
        ) {
          try {
            // remove files and folders that aren't allow in the workspaces
            // directory
            fse.removeSync(path.join(workspacesDirectory, file));
          } catch {
            // ignore
          }
          return [];
        }

        let settings = new WorkspaceSettings(
          path.join(workspacesDirectory, file),
          path.join(workspacesDirectory, file, "chaindata")
        );

        const isQuickstart = settings.get("isDefault");
        if (isQuickstart) {
          // the default workspace shouldn't be in the "workspaces" directory,
          // delete it.
          fse.remove(settings.settings.directory).catch((e) => e);
          return [];
        }
        settings.bootstrap();

        const name = settings.get("name");
        const sanitizedName = Workspace.getSanitizedName(name);
        if (sanitizedName !== file) {
          // apparently the Settings file has a name that is not equal to the directory,
          //   we need to move the directory
          try {
            fse.moveSync(
              path.join(workspacesDirectory, file),
              path.join(workspacesDirectory, sanitizedName)
            );
          } catch (e) {
            // It's okay that we ignore move errors, promise!
            // This happens because a user tried to name two or more
            // workspaces with the same name. We only name workspace folders
            // by name because it is a little easier for us to debug.
            // We should *probably* just append the uuid of the workspace
            // to the dir name, to ensure uniqueness.
            console.error(e);
          }
        }
        const flavor = settings.get("flavor");
        return [new Workspace(name, this.directory, flavor)];
      });
    }

    this.workspaces.push(new Workspace(null, this.directory, "ethereum"));
    this.workspaces.push(new Workspace(null, this.directory, "filecoin"));
  }

  bootstrap() {
    this.enumerateWorkspaces();
    for (let i = 0; i < this.workspaces.length; i++) {
      this.workspaces[i].bootstrap();
    }
  }

  getNonDefaultNames() {
    return this.workspaces
      .filter((workspace) => workspace.name !== null)
      .map((workspace) => ({ name: workspace.name, flavor: workspace.flavor }));
  }

  get(name, flavor = "ethereum") {
    return this.workspaces.find(
      (workspace) =>
        name === workspace.name && isFlavor(workspace.flavor, flavor)
    );
  }
}

function isFlavor(flavorA, flavorB) {
  if (flavorA === undefined && flavorB === "ethereum") {
    return true;
  } else {
    return flavorA === flavorB;
  }
}

export default WorkspaceManager;
