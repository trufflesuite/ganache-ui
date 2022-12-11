import path from "path";
import ethereum from "./ethereum";
import filecoin from "./filecoin";
import EventEmitter from "events";
import WorkspaceManager from "../main/types/workspaces/WorkspaceManager";
import extras from "../common/extras";

import {
  SAVE_WORKSPACE
} from "../common/redux/workspaces/actions";

class IntegrationManager extends EventEmitter {
  constructor(userDataPath, ipc, isDevMode = false) {
    super();

    this.userDataPath = userDataPath;
    this.config = extras.init(path.join(userDataPath, "extras"));
    this.isDevMode = isDevMode;
    this.ipc = ipc;
    this.integrations = {
      ethereum,
      filecoin
    };
    this.workspaceManager = new WorkspaceManager(userDataPath);
    this._listen();
  }

  async _listen() {
    this.ipc.on(SAVE_WORKSPACE, this._saveWorkspace.bind(this));
  }

  async setWorkspace(name, flavor) {
    const desiredWorkspace = this.workspaceManager.get(name, flavor);
    if (desiredWorkspace == undefined) {
      throw new Error("Workspace not found");
    }
    this.workspace = null;
    await this.stopChain();
    this.startChainWithWorkspace(flavor, desiredWorkspace);
  }

  async startChainWithWorkspace(flavor, workspace) {
    const integrations = this.integrations;
    if (Object.prototype.hasOwnProperty.call(integrations, flavor)) {
      const integration = (this.flavor = new integrations[flavor](
        this,
        workspace
      ));
      integration.name = flavor;
      integration.on("message", (...args) => {
        this.emit.apply(this, args);
      });
      this.workspace = workspace;
      await this.startChain();
    } else {
      throw new Error("Invalid flavor: " + flavor);
    }
  }

  async _saveWorkspace(_event, workspaceName, mnemonic) {
    let workspace = this.workspace;
    let chaindataLocation = null;
    if (workspace) {
      chaindataLocation = workspace.chaindataDirectory || (await this.flavor.chain.getDbLocation());
    } else {
      workspace = this.workspaceManager.get(null);
    }

    workspace.saveAs(
      workspaceName,
      chaindataLocation,
      this.workspaceManager.directory,
      mnemonic,
      // we persist this workspace in the /Quickstart directory, and will move
      // it to the correct location in workspaceManager.enumerateWorkspaces()
      false
    );
    await this.setWorkspace(workspaceName, workspace.flavor);
    this.emit("server-started");
  }

  async startChain() {
    if (this.flavor) {
      return this.flavor.start();
    }
  }

  async stopChain() {
    if (this.flavor) {
      return this.flavor.stop();
    }
  }

  async startServer() {
    if (this.flavor && this.workspace) {
      const settings = this.workspace.settings.getAll();
      try {
        await this.flavor.startServer(settings, this.workspace.workspaceDirectory);
        // just incase startServer mutates the settings, save them
        // todo: not sure whether we still need to do this?
        this.workspace.settings.setAll(settings);

        this.emit("server-started");
        return true;
      } catch (e) {
        this.emit("error", e);
        return false;
      }
    }
  }

  async stopServer() {
    if (this.flavor) {
      await this.flavor.stopServer();
    }
  }
}

export default IntegrationManager;
