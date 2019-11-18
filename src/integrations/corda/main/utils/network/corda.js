const { spawn } = require("child_process");
const { join } = require("path");

class Corda {
  constructor(entity, path, JAVA_HOME){
    this.entity = entity;
    this.path = path;
    this.JAVA_HOME = JAVA_HOME;
    this.java = null;
  }

  start(){
    this.java = spawn(join(this.JAVA_HOME, "bin", "java"), ["-jar", "corda.jar"], {cwd: this.path, env: null});

    this.java.stderr.on('data', (data) => {
      console.error(`stderr:\n${data}`);
    });

    this.java.on("error", console.error);

    return new Promise((resolve, reject) => {
      this.java.once('close', (code) => {
        // TODO: handle premature individual node shutdown
        /// close postgres, close other nodes, what do?
        console.log(`child process exited with code ${code}`);
        reject();
      });

      this.java.stdout.on('data', (data) => {
        console.log(`${data}`);
        if (data.toString().includes('" started up and registered in ')) {
          resolve();
        }
      });
    });
  }

  stop(){
    return new Promise(resolve => {
      if (this.java && !this.java.killed) {
        this.java.once("close", resolve);
        this.java.kill();      
      } else {
        resolve();
      }
    });
  }
}

module.exports = Corda;
