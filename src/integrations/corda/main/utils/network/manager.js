const { CordaBootstrap } = require("./bootstrap");
const { EventEmitter } = require("events");
const { basename, join } = require("path");
const postgres = require("../postgres");
const Braid = require("./braid");
const Corda = require("./corda");
const fse = require("fs-extra");

class IO {
  constructor(context){
    const createMsgEmitter = (...args) => context.emit.bind(context, "message", ...args);
    this.sendProgress = createMsgEmitter("progress");
    this.sendError = createMsgEmitter("error");
    this.sendStdErr = createMsgEmitter("stderr");
    this.sendStdOut = createMsgEmitter("stdout");
  }
}

class NetworkManager extends EventEmitter {
  constructor (config, workspaceDirectory) {
    super();
    this.config = config;
    this.workspaceDirectory = workspaceDirectory;
    this.nodes = [];
    this.notaries = [];
    this.processes = [];
    this._io = new IO(this);
  }

  async bootstrap(nodes, notaries, port = 10000) {
      const BRAID_HOME = this.config.corda.files.braidServer.download();
      const POSTGRES_HOME = this.config.corda.files.postgres.download();
      this._io.sendProgress("Writing configuration files...");
      const cordaBootstrap = new CordaBootstrap(this.workspaceDirectory, this._io);
      const {nodesArr, notariesArr} = await cordaBootstrap.writeConfig(nodes, notaries, port);
      this.nodes = nodesArr;
      this.notaries = notariesArr;
      this.entities = this.nodes.concat(this.notaries);
      this._io.sendProgress("Configuring and starting PostgreSQL...");
      this.pg = postgres(await POSTGRES_HOME).start(this.entities[0].dbPort, this.workspaceDirectory, this.entities);
      this._io.sendProgress("Bootstrapping network...");
      await cordaBootstrap.bootstrap(this.config);
      this._io.sendProgress("Copying Cordapps...");
      await this.copyCordappsAndSetupNetwork();
      this._io.sendProgress("Configuring RPC Manager...");
      this.braid = new Braid(join(await BRAID_HOME, ".."), this._io);
  }

  async copyCordappsAndSetupNetwork() {
    const promises = [];
    const networkMap = new Map();
    this.nodes.forEach((node) => {
      const currentDir = join(this.workspaceDirectory, node.safeName);
      node.cordapps.forEach(path => {
        const name = basename(path);
        const newPath = join(currentDir, "cordapps", name);
        promises.push(fse.copy(path, newPath));
      });
      const info = fse.readdirSync(currentDir).filter(file => file.startsWith("nodeInfo-")).reduce((p, name) => name, "");
      const knownNodesDir = join(currentDir, "additional-node-infos");
      const currentlyKnownNodes = fse.readdirSync(knownNodesDir).map(file => ({file, path: join(knownNodesDir, file)}));
      networkMap.set(node.safeName, {nodes: node.nodes, info, currentlyKnownNodes});
    });
    networkMap.forEach((val, _key, nMap) => {
      const needed = new Set([val.info, ...val.nodes.map((node) => nMap.get(node).info)]);
      val.currentlyKnownNodes.forEach(node => {
        if (!needed.has(node.file)) {
          promises.push(fse.remove(node.path));
        }
    });
    });
    return Promise.all(promises);      
  }

  async start(){
      const entities = this.entities;
      this._io.sendProgress("Loading JRE...");
      const JAVA_HOME = await this.config.corda.files.jre.download();

      this._io.sendProgress("Starting Corda Nodes...");
      let startedNodes = 0;
      const promises = entities.map(async (entity) => {
        const currentPath = join(this.workspaceDirectory, entity.safeName);
        const braidPromise = this.braid.start(entity, currentPath, JAVA_HOME);
        const corda = new Corda(entity, currentPath, JAVA_HOME, this._io);
        this.processes.push(corda);
        await Promise.all([corda.start(), braidPromise]);
        this._io.sendProgress(`Corda node ${++startedNodes}/${entities.length} online...`)
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

    return Promise.all([...this.processes.map(cordaProcess => cordaProcess.stop()), this.braid && this.braid.stop()]);
  }
  
  getNodes(){
    return this.nodes;
  }

  getNotaries(){
    return this.notaries;
  }
}

module.exports = NetworkManager;
