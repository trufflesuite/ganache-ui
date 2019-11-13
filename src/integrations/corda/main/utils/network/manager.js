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
        java.once('close', (code) => {
          // TODO: handle premature individual node shutdown
          /// close postgres, close other nodes, what do?
          console.log(`child process exited with code ${code}`);
          reject();
        });

        java.stdout.on('data', (data) => {
          console.log(`${data}`);
          if (data.toString().includes('" started up and registered in ')) {
            resolve({
              process: java,
              entity
            });
          }
        });
      });
    });
    return Promise.all(promises).then((entities) => {
      entities.forEach(({process}) => {
        this.processes.push(process);
      })
      return entities;
    });
  }
  stop() {
    try {
      this.pg && this.pg.stop();
      this.pg = null;
    } catch(e) {
      console.error("Error occured while attempting to stop postgres...");
      console.error(e);
    }
    let process;
    let promises = [];
    while (process = this.processes.shift()) {
      promises.push(new Promise(resolve => {
        process.once("close", resolve);
      }));
      if (!process.killed) {
        process.kill();
      }
    }
    return Promise.all(promises);
  }
  
  getNodes(){
    return this.nodes;
  }

  getNotaries(){
    return this.notaries;
  }
}

module.exports = NetworkManager;
