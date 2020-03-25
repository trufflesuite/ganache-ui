import path from "path";
import fse from "fs-extra";
import UUID from "uuid";

import WorkspaceSettings from "../settings/WorkspaceSettings";
import ContractCache from "../contracts/ContractCache";

class Workspace {
  constructor(name, configDirectory) {
    this.name = name; // null for quickstart/default workspace
    this.projects = [];
    this.init(configDirectory);

    // This doesn't go in the init() function because the init is used for initializing
    //   the other parameters (and when the workspaced is "Saved As" something else)
    this.settings = new WorkspaceSettings(
      this.workspaceDirectory,
      this.chaindataDirectory,
    );

    this.contractCache = new ContractCache(this.workspaceDirectory);
  }

  init(configDirectory) {
    this.sanitizedName = Workspace.getSanitizedName(this.name);
    this.workspaceDirectory = Workspace.generateDirectoryPath(
      this.sanitizedName,
      configDirectory,
    );
    this.basename = path.basename(this.workspaceDirectory);
    this.chaindataDirectory = this.generateChaindataDirectory();
  }

  static getSanitizedName(name) {
    return name === null
      ? null
      : name.replace(/\s/g, "-").replace(/[^a-zA-Z0-9\-\_\.]/g, "");
  }

  static generateDirectoryPath(sanitizedName, configDirectory) {
    if (sanitizedName === null) {
      return path.join(configDirectory, "default");
    } else {
      return path.join(configDirectory, "workspaces", sanitizedName);
    }
  }

  generateChaindataDirectory() {
    if (this.name === null) {
      return null;
    } else {
      return path.join(this.workspaceDirectory, "chaindata");
    }
  }

  // creates the directory if needed (recursively)
  bootstrapDirectory() {
    // make sure the workspace directory exists
    fse.mkdirpSync(this.workspaceDirectory);

    // make sure the chaindata folder exists
    if (this.chaindataDirectory) {
      fse.mkdirpSync(this.chaindataDirectory);
    }
  }

  bootstrap() {
    this.bootstrapDirectory();
    this.settings.bootstrap();
  }

  saveAs(name, chaindataDirectory, configDirectory, mnemonic) {
    this.name = name;
    this.init(configDirectory);
    this.bootstrapDirectory();

    this.settings.setDirectory(this.workspaceDirectory);
    this.settings.set("name", name);
    this.settings.set("isDefault", false);
    this.settings.set("randomizeMnemonicOnStart", false);
    this.settings.set("server.mnemonic", mnemonic);

    this.contractCache.setDirectory(this.workspaceDirectory);
    this.contractCache.setAll(this.contractCache.getAll());

    if (chaindataDirectory && chaindataDirectory !== this.chaindataDirectory) {
      fse.copySync(chaindataDirectory, this.chaindataDirectory);
    }
  }

  addProject(project) {
    this.projects.push(project);
  }

  delete() {
    try {
      fse.removeSync(this.workspaceDirectory);
    } catch (e) {
      // TODO: couldn't delete the directory; probably don't have
      // permissions or some file is open somewhere. we probably
      // want to handle this better (i.e. return false, then send
      // a message to renderer process, display toast saying there
      // were issues, etc.). Don't really have time right now for
      // a solution here
    }
  }

  resetChaindata() {
    try {
      fse.removeSync(this.chaindataDirectory);
      fse.mkdirpSync(this.chaindataDirectory);
    } catch (e) {
      // TODO: couldn't delete/create the directory; probably don't have
      // permissions or some file is open somewhere. we probably
      // want to handle this better (i.e. return false, then send
      // a message to renderer process, display toast saying there
      // were issues, etc.). Don't really have time right now for
      // a solution here
    }
  }

  clone(cloneName) {
    const sanitizedName = Workspace.getSanitizedName(cloneName);
    const configDirectory = path.join(this.workspaceDirectory, "..", "..");
    const cloneDirectory = path.join(
      configDirectory,
      "workspaces",
      sanitizedName,
    );

    try {
      // copy workspace directory, make sure not to overwrite any existing data
      fse.copySync(this.workspaceDirectory, cloneDirectory, {
        overwrite: false,
        errorOnExist: true,
      });
    } catch (e) {
      // Failed to copy directory. Most likely target already exists
      // TODO: Handle this error more gracefully/provide user feedback
      return;
    }

    // update settings of cloned workspace to match new location
    const db_path = path.join(cloneDirectory, "chaindata");
    let settings = new WorkspaceSettings(cloneDirectory, db_path);
    settings.bootstrap();
    // set new db_path
    settings.set("server.db_path", db_path);
    // generate new uuid
    settings.set("uuid", UUID.v4());
    // set new name
    settings.set("name", cloneName);
    return new Workspace(cloneName, configDirectory);
  }
}

export default Workspace;
