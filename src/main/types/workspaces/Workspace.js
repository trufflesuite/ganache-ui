import path from "path";
import fse from "fs-extra";
import temp from "temp";

import WorkspaceSettings from "../settings/WorkspaceSettings";
import ContractCache from "../../../integrations/ethereum/main/types/contracts/ContractCache";

class Workspace {
  constructor(name, configDirectory, flavor = "ethereum") {
    this.name = name; // null for quickstart/default workspace
    this.flavor = flavor;
    this.projects = [];
    this.init(configDirectory);

    // This doesn't go in the init() function because the init is used for initializing
    //   the other parameters (and when the workspaced is "Saved As" something else)
    this.settings = new WorkspaceSettings(
      this.workspaceDirectory,
      this.chaindataDirectory,
      flavor
    );

    // migrate to new contract cache location (in `chaindataDirectory):
    const oldLocation = path.join(this.workspaceDirectory, ContractCache.KEY);
    if (fse.existsSync(oldLocation)){
      const newLocation = path.join(this.chaindataDirectory, ContractCache.KEY);
      fse.moveSync(oldLocation, newLocation)
    }

    this.contractCache = new ContractCache(this.chaindataDirectory);
  }

  init(configDirectory) {
    this.sanitizedName = Workspace.getSanitizedName(this.name);
    this.workspaceDirectory = Workspace.generateDirectoryPath(
      this.sanitizedName,
      configDirectory,
      this.flavor
    );
    this.basename = path.basename(this.workspaceDirectory);
    this.chaindataDirectory = this.generateChaindataDirectory();
  }

  static getSanitizedName(name) {
    return name === null
      ? null
      : name.replace(/\s/g, "-").replace(/[^a-zA-Z0-9\-_.]/g, "");
  }

  static generateDirectoryPath(sanitizedName, configDirectory, flavor = "ethereum") {
    if (sanitizedName === null) {
      if (flavor === "ethereum") {
        return path.join(configDirectory, "default");
      } else {
        return path.join(configDirectory, `default_${flavor}`);
      }
    } else {
      return path.join(configDirectory, "workspaces", sanitizedName);
    }
  }

  generateChaindataDirectory() {
    if (this.name === null) {
      return temp.path();
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
    if (this.flavor === "corda") {
      this.settings.set("runBootstrap", true);
    }
    this.settings.set("randomizeMnemonicOnStart", false);
    this.settings.set("server.mnemonic", mnemonic);

    // make sure contractCache is in the right location:
    if (chaindataDirectory && chaindataDirectory !== this.chaindataDirectory) {
      fse.copySync(chaindataDirectory, this.chaindataDirectory);
    }
    const currentContractCachePath = path.join(this.contractCache.storage.directory, this.contractCache.storage.name);
    const desiredContractCachePath = path.join(this.chaindataDirectory, this.contractCache.storage.name);
    if (currentContractCachePath !== desiredContractCachePath && fse.existsSync(currentContractCachePath)) {
      fse.copySync(currentContractCachePath, desiredContractCachePath);
    }

    this.contractCache.setDirectory(this.chaindataDirectory);
    this.contractCache.setAll(this.contractCache.getAll());
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
    this.bootstrap();
    // make sure the directory is correct
    this.contractCache.setDirectory(this.chaindataDirectory);
    // and then make sure we cleat the contract cache storage
    this.contractCache.setAll({});
  }
}

export default Workspace;
