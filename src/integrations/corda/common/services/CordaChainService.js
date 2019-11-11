import EventEmitter from "events";
import utils from "../../main/utils";
const NetworkManager = utils.network.NetworkManager;

class CordaChainService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  start() {
    this.emit("message", "start");
    this.emit("process-started");
    this.emit("message", "process-started");
  }

  async startServer(settings, workspaceDirectory) {
    await this.stopServer();
    const manager = this.manager = new NetworkManager(this.config, workspaceDirectory);
    console.log("bootstrapping...");
    await manager.bootstrap(settings.nodes, settings.notaries);
    console.log("starting...");
    await manager.start();
    console.log("server started");

    this._serverStarted = true;
    this.emit("server-started");
    this.emit("message", "server-started");
  }

  async stopServer() {
    if (this.manager) {
      const stop = await this.manager.stop();
      this.emit("server-stopped");
      this.emit("message", "server-stopped");
      return stop;
    }
  }

  getDbLocation() {
    return new Promise(resolve => {
      resolve(undefined);
    });
  }

  stopProcess() {
    
  }
}

export default CordaChainService;
