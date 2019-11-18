const {writeConfig, bootstrap : bootstrapDir} = require("./bootstrap");
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
  }

  async bootstrap(nodes, notaries, port = 10000) {
    // const mapper = (arr) => arr.map((val) => new Map(Object.entries(val)));
    const BRAID_HOME = this.config.corda.files.braidServer.download();
    const POSTGRES_HOME = this.config.corda.files.postgres.download();
    this.emit("message", "progress", "Writing configuration files...");
    const {nodesArr, notariesArr} = await writeConfig(this.workspaceDirectory, nodes, notaries, port);
    this.nodes = nodesArr;
    this.notaries = notariesArr;
    this.entities = this.nodes.concat(this.notaries);
    this.emit("message", "progress", "Configuring and starting PostgreSQL...");
    this.pg = postgres(await POSTGRES_HOME).start(this.entities[0].dbPort, this.workspaceDirectory, this.entities);
    this.emit("message", "progress", "Bootstrapping nodes...");
    await bootstrapDir(this.workspaceDirectory, this.config);
    this.emit("message", "progress", "Copying Cordapps...");
    await this.copyCordapps();
    this.emit("message", "progress", "Configuring Braid Manager...");
    this.braid = new Braid(join(await BRAID_HOME, ".."));
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
    this.emit("message", "progress", "Loading JRE...");
    const JAVA_HOME = await this.config.corda.files.jre.download();

    const promises = entities.map((entity) => {
      const currentPath = join(this.workspaceDirectory, entity.safeName);
      this.braid.start(entity, currentPath, JAVA_HOME);
      const corda = new Corda(entity, currentPath, JAVA_HOME);
      this.processes.push(corda);
      return corda.start();
    });

    this.emit("message", "progress", "Starting Corda Nodes and Braid Servers...");
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
    return Promise.all(this.processes.map(cordaProcess => cordaProcess.stop()))
  }
  
  getNodes(){
    return this.nodes;
  }

  getNotaries(){
    return this.notaries;
  }
}

module.exports = NetworkManager;
