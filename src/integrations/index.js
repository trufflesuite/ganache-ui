import path from "path";
import ethereum from "./ethereum";
import corda from "./corda";
import EventEmitter from "events";
import WorkspaceManager from "../main/types/workspaces/WorkspaceManager";
import extras from "../common/extras";
import GetPort from "get-port";

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
      corda
    };
    this.workspaceManager = new WorkspaceManager(userDataPath);
    this._listen();
  }

  async _listen() {
    this.ipc.on(SAVE_WORKSPACE, this._saveWorkspace.bind(this));
  }

  async setWorkspace(name, flavor) {
    await this._setFlavor(flavor);
    this.workspace = this.workspaceManager.get(name, flavor);
  }

  async _setFlavor(flavor) {
    const integrations = this.integrations;
    if (Object.prototype.hasOwnProperty.call(integrations, flavor)) {
      if (this.flavor) {
        // We're *not* switching chains, so don't need to do anything.
        if (this.flavor.name === flavor) return;

        // We're switching chains; invalid the previous workspace and then
        // shut down the old chain completely
        this.workspace = null;
        await this.stopChain();
      }

      const integration = this.flavor = new integrations[flavor](this);
      integration.name = flavor;
      integration.on("message", (...args) => {
        this.emit.apply(this, args);
      });
      await this.startChain();
    } else {
      throw new Error("Invalid flavor: " + flavor);
    }
  }

  async _saveWorkspace(_event, workspaceName, mnemonic) {
    await this.flavor.stopServer();

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
      mnemonic
    );

    await this.workspaceManager.bootstrap();

    await this.setWorkspace(workspaceName, workspace.flavor);

    await this.startServer();
  }

  async startChain() {
    if (this.flavor) {
      await this.flavor.start();
    }
  }

  async stopChain() {
    if (this.flavor) {
      await this.flavor.stop();
    }
  }

  async getPorts(...entities){
    const ports = new Set();
    const getUniquePort = (port) => {
      while (ports.has(port)) port++;
      ports.add(port);
      return GetPort({port});
    }
    for (const nodes of entities) {
      for (const node of nodes) {
        node.adminPort = await getUniquePort(node.adminPort);
        node.p2pPort = await getUniquePort(node.p2pPort);
        node.rpcPort = await getUniquePort(node.rpcPort);
      }
    }
  }

  async startServer() {
    if (this.flavor && this.workspace) {
      const settings = this.workspace.settings.getAll();
      if (this.flavor.name === "corda") {
        await this.getPorts(settings.nodes, settings.notaries);
      }
      await this.flavor.startServer(settings, this.workspace.workspaceDirectory);
      // just incase startServer mutates the settings (corda does), save them
      this.workspace.settings.setAll(settings);
    }
  }

  async stopServer() {
    if (this.flavor) {
      await this.flavor.stopServer();
    }
  }
}

export default IntegrationManager;
