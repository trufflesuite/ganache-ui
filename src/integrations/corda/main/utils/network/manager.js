const {writeConfig, bootstrap} = require("./bootstrap");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");
const { join } = require("path");
const postgres = require("../postgres");

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
    const POSTGRES_HOME = await this.config.corda.files.postgres.download();
    const {nodesArr, notariesArr} = await writeConfig(this.workspaceDirectory, nodes, notaries, port);
    this.nodes = nodesArr;
    this.notaries = notariesArr;
    this.entities = this.nodes.concat(this.notaries);
    this.pg = postgres(POSTGRES_HOME).start(15433, this.workspaceDirectory, this.entities);
    const output = await bootstrap(this.workspaceDirectory, this.config);
    
    this.emit("bootstrap", output);
    return output;
  }

  async start(){
    const entities = this.entities;
    const JAVA_HOME = await this.config.corda.files.jre.download();

    const promises = entities.map((entity) => {
      const currentPath = join(this.workspaceDirectory, entity);
      const java = spawn("java", ["-jar", "corda.jar"], {
        cwd : currentPath,
        env : {
          PATH : `${JAVA_HOME}/bin:$PATH`
        }
      });

      java.stderr.on('data', (data) => {
        console.error(`stderr:\n${data}`);
      });

      java.on("error", console.error);

      return new Promise((resolve, reject) => {
        java.on('close', (code) => {
          // TODO: handle premature individual node shutdown
          /// close postgres, close other nodes, what do?
          console.log(`child process exited with code ${code}`);
          reject();
        });

        java.stdout.on('data', (data) => {
          console.log(`${data}`);
          if (data.toString().includes('" started up and registered in ')) {
            resolve();
          }
        });
      });
    });
    await Promise.all(promises);
  }
  stop(){
    this.pg && this.pg.stop();
  }
  
  getNodes(){
    return this.nodes;
  }

  getNotaries(){
    return this.notaries;
  }
}

module.exports = NetworkManager;
