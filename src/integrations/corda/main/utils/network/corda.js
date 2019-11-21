const { spawn } = require("child_process");
const { join } = require("path");

class Corda {
  constructor(entity, path, JAVA_HOME, io) {
    this.entity = entity;
    this.path = path;
    this.JAVA_HOME = JAVA_HOME;
    this.java = null;
    this._io = io;
  }

  start(){
    this.java = spawn(join(this.JAVA_HOME, "bin", "java"), ["-jar", "corda.jar"], {cwd: this.path, env: null});

    this.java.stderr.on('data', (data) => {
      this._io.sendStdErr(data, this.entity.safeName);
      // this.emit("message", "stderr", data, this.entity.safeName);
      console.error(`stderr:\n${data}`);
    });

    this.java.stdout.on('data', (data) => {
      this._io.sendStdOut(data, this.entity.safeName);
      // this.emit("message", "stdout", data, this.entity.safeName);
      console.error(`stdout:\n${data}`);
    });

    this.java.on("error", console.error);

    return new Promise((resolve, reject) => {
      const rejectionHandler = async (code) => {
        console.log(`child process exited with code ${code}`);
        await this.stop();
        reject();
      }
      this.java.once('close', rejectionHandler);

      this.java.stdout.on('data', function startUpListener(data) {
        if (data.toString().includes('" started up and registered in ')) {
          this.java.stdout.removeListener('data', startUpListener);
          this.java.removeListener('close', rejectionHandler);
          resolve();
        }
      }.bind(this));
    });
  }

  stop(){
    return new Promise(resolve => {
      if (this.java) {
        if (this.java.exitCode === null) {
          this.java.once("close", ()=>{
            this.java = null;
            resolve();
          });
          if(!this.java.killed) {
            this.java.kill();      
          }
        } else {
          this.java = null;
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
}

module.exports = Corda;
