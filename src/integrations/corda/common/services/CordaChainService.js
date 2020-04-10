import EventEmitter from "events";
import { NetworkManager } from "../../main/utils/network";

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

  async stop() {
    await this.stopServer();
    this.emit("message", "stop");
    this.emit("process-stopped");
    this.emit("message", "process-stopped");
  }

  async startServer(settings, workspaceDirectory) {
    this.emit("message", "progress", "Stopping server...");
    await this.stopServer();
    const manager = this.manager = new NetworkManager(this.config, settings, workspaceDirectory);
    manager.on("message", this.emit.bind(this, "message"));

    if (!settings.postgresPort) {
      // eslint-disable-next-line require-atomic-updates
      settings.postgresPort = await manager.getPort(15432);
    }

    console.log("bootstrapping...");
    try {
      await manager.bootstrap(settings.nodes, settings.notaries, settings.postgresPort);
      console.log("starting...");
      await manager.start();
      console.log("server started");

      this._serverStarted = true;
      this.emit("server-started");
      this.emit("message", "server-started");
    } catch(e) {
      await manager.stop();
      throw e;
    }
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
    return this.manager ? this.manager.chaindataDirectory : Promise.resolve(null);
  }
}

export default CordaChainService;
