import { EventEmitter } from "events";

class Integrations extends EventEmitter {
  constructor(integrationManager) {
    super();
    this._integrationManager = integrationManager;
    this.ipc = this._integrationManager.ipc;
    this.chain = null;
    this.send = integrationManager.emit.bind(integrationManager, "send");
  }
  async start() {
    if (this.chain) {
      return this.chain.start();
    }
  }
  async startServer(workspaceSettings) {
    if (this.chain) {
      return this.chain.startServer(workspaceSettings);
    }
  }
  async stop() {
    if (this.chain) {
      return this.chain.stop();
    }
  }
  async stopServer() {
    if (this.chain) {
      return this.chain.stopServer();
    }
  }
}

export default Integrations;