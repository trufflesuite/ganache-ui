const { CordaBootstrap } = require("./bootstrap");
const { EventEmitter } = require("events");
const { basename, join } = require("path");
const postgres = require("../postgres");
const Braid = require("./braid");
const Corda = require("./corda");
const fse = require("fs-extra");

class NetworkManager extends EventEmitter {
  constructor (config, workspaceDirectory) {
    super();
    this.config = config;
    this.workspaceDirectory = workspaceDirectory;
    this.nodes = [];
    this.notaries = [];
    this.processes = [];
    this._io = {};
    this._io.progress = this.emit.bind(this, "message", "progress");
    this._io.error = this.emit.bind(this, "message", "error");
    this._io.stdErr = this.emit.bind(this, "message", "stderr");
    this._io.stdOut = this.emit.bind(this, "message", "stdout");
  }

  async bootstrap(nodes, notaries, port = 10000) {
      const BRAID_HOME = this.config.corda.files.braidServer.download();
      const POSTGRES_HOME = this.config.corda.files.postgres.download();
      this.sendProgress("Writing configuration files...");
      const cordaBootstrap = new CordaBootstrap(this.workspaceDirectory, this._io);
      const {nodesArr, notariesArr} = await cordaBootstrap.writeConfig(nodes, notaries, port);
      this.nodes = nodesArr;
      this.notaries = notariesArr;
      this.entities = this.nodes.concat(this.notaries);
      this.sendProgress("Configuring and starting PostgreSQL...");
      this.pg = postgres(await POSTGRES_HOME).start(this.entities[0].dbPort, this.workspaceDirectory, this.entities);
      this.sendProgress("Bootstrapping network...");
      await cordaBootstrap.bootstrap(this.config);
      this.sendProgress("Copying Cordapps...");
      await this.copyCordapps();
      this.sendProgress("Configuring RPC Manager...");
      this.braid = new Braid(join(await BRAID_HOME, ".."), this._io);
  }

  async copyCordapps() {
    const promises = [];
    this.entities.map((node) => {
      node.cordapps.map(path => {
        const name = basename(path);
        const newPath = join(this.workspaceDirectory, node.safeName, "cordapps", name);
        promises.push(fse.copy(path, newPath));
      });
    });
    return Promise.all(promises);      
  }

  async start(){
      const entities = this.entities;
      this.sendProgress("Loading JRE...");
      const JAVA_HOME = await this.config.corda.files.jre.download();

      this.sendProgress("Starting Corda Nodes...");
      let startedNodes = 0;
      const promises = entities.map(async (entity) => {
        const currentPath = join(this.workspaceDirectory, entity.safeName);
        const braidPromise = this.braid.start(entity, currentPath, JAVA_HOME);
        const corda = new Corda(entity, currentPath, JAVA_HOME, this._io);
        corda.on("message", this.emit.bind(this, "message"));
        this.processes.push(corda);
        await Promise.all([corda.start(), braidPromise]);
        this.sendProgress(`Corda node ${++startedNodes}/${entities.length} online...`)
      });

      return Promise.all(promises);
  }

  stop() {
    try {
      this.pg && this.pg.stop();
      this.pg = null;
    } catch(e) {
      console.error("Error occured while attempting to stop postgres...");
      console.error(e);
    }

    return Promise.all([...this.processes.map(cordaProcess => cordaProcess.stop()), this.braid.stop()]);
  }
  
  getNodes(){
    return this.nodes;
  }

  getNotaries(){
    return this.notaries;
  }
}

module.exports = NetworkManager;
