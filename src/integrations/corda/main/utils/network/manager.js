const {writeConfig, bootstrap : bootstrapDir} = require("./bootstrap");
const { EventEmitter } = require("events");
const { join } = require("path");
const postgres = require("../postgres");
const Braid = require("./braid");
const Corda = require("./corda");

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
    const BRAID_HOME = this.config.corda.files.braidServer.download();
    const POSTGRES_HOME = this.config.corda.files.postgres.download();
    const {nodesArr, notariesArr} = await writeConfig(this.workspaceDirectory, nodes, notaries, port);
    this.nodes = nodesArr;
    this.notaries = notariesArr;
    this.entities = this.nodes.concat(this.notaries);
    this.pg = postgres(await POSTGRES_HOME).start(15433, this.workspaceDirectory, this.entities);
    await bootstrapDir(this.workspaceDirectory, this.config);
    this.braid = new Braid(await BRAID_HOME);
    // this.emit("bootstrap", output);
    // return output;
  }

  

  async start(){
    const entities = this.entities;
    const JAVA_HOME = await this.config.corda.files.jre.download();
    const config = { env : { PATH : `${JAVA_HOME}/bin:$PATH` } };

    const promises = entities.map((entity) => {
      const currentPath = join(this.workspaceDirectory, entity);
      const currentConfig = Object.assign({ cwd : currentPath }, config);
      this.braid.start(entity, currentPath);
      const corda = new Corda(entity, currentConfig);
      this.processes.push(corda);
      return corda.start();
    });
    this.braid.getAll();
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
