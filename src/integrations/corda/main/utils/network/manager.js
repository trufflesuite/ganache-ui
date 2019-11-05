const bootstrap = require("./bootstrap");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");
const { join } = require("path");

class NetworkManager extends EventEmitter {
  constructor () {
    super();
    this.nodes = [];
    this.notaries = [];
    this.processes = [];
  }

  async bootstrap(numOfNodes, numOfNotaries, port = 10000){
    const output = await bootstrap(numOfNodes, numOfNotaries, port);
    console.log(output);
    const { nodes, notaries } = output;
    this.nodes = nodes;
    this.notaries = notaries;
    this.emit("bootstrap", output);
    return output;
  }

  async start(){
    const entities = this.nodes.concat(this.notaries);
    const projectHome = join(__dirname, "../../../../../..", "integrations/corda");
    const JAVA_HOME = join(projectHome, "java/OpenJDK/OpenJDK8U-jre_x64_linux_hotspot_8u232b09");
    // this.entities = [];
    const promises = [];
    entities.forEach((entity) => {
      const currentPath = join(projectHome, "corda", entity);
      console.log(currentPath);
      console.log(JAVA_HOME);
      const java = spawn("java", ["-jar", "corda.jar"], {
        cwd : currentPath,
        env : {
          PATH : `${JAVA_HOME}/bin:$PATH`
        }
      });

      java.stdout.on('data', (data) => {
        console.log(`${data}`);
      });

      java.stderr.on('data', (data) => {
        console.error(`stderr:\n${data}`);
      });
      promises.push(new Promise((resolve) => {
        java.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
          resolve();
        });
      }));

      java.on("error", console.log);
    })
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
