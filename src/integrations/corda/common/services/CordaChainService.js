import EventEmitter from "events";
import utils from "../../main/utils";
const NetworkManager = utils.network.NetworkManager;

class CordaChainService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  start() {
    this.emit("start");
  }

  async startServer(workspaceDirectory, settings) {
    await this.stopServer();
    const manager = this.manager = new NetworkManager(this.config, workspaceDirectory);
    const output = await manager.bootstrap(settings.nodes, settings.notaries);
    await manager.start();
    console.log("server started");

    this._serverStarted = true;
    this.emit("server-started", output);
  }

  async stopServer() {
    if (this.manager) {
      return await this.manager.stop();
    }
  }

  getDbLocation() {
    return new Promise(resolve => {
      
    });
  }

  stopProcess() {
    
  }
}

export default CordaChainService;
