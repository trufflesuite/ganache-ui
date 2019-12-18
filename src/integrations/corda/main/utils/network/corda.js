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
    console.log(join(this.JAVA_HOME, "bin", "java"), ["-jar", "corda.jar"], {cwd: this.path, env: null});
    this.java = spawn(join(this.JAVA_HOME, "bin", "java"), ["-jar", "corda.jar"], {cwd: this.path, env: null});

    this.java.stderr.on('data', (data) => {
      this._io.sendStdErr(data, this.entity.safeName);
      // this.emit("message", "stderr", data, this.entity.safeName);
      console.error(`corda stderr:\n${data}`);
    });

    this.java.stdout.on('data', (data) => {
      this._io.sendStdOut(data, this.entity.safeName);
      // this.emit("message", "stdout", data, this.entity.safeName);
      console.error(`corda stdout:\n${data}`);
    });

    this.java.on("error", console.error);

    return new Promise((resolve, reject) => {
      const closeHandler = async (code) => {
        console.log(`child process exited with code ${code}`);
        await this.stop();
        reject(new Error(`child process exited with code ${code}`));
      }
      const startUpListener = (data) => {
        console.log(data.toString());
        if (data.toString().includes('" started up and registered in ')) {
          this.java.stdout.removeListener('data', startUpListener);
          this.java.stderr.removeListener('data', errListener);
          this.java.removeListener('close', closeHandler);
          resolve();
        }
      }
      const errListener = async (data) => {
        if (data.toString().includes('CAPSULE EXCEPTION: Capsule not extracted.')) {
          this.java.stdout.removeListener('data', startUpListener);
          this.java.stderr.removeListener('data', errListener);
          this.java.removeListener('close', closeHandler);
          await this.stop();
          this._io.sendStdErr("Recovering from CAPSULE EXCEPTION...", this.entity.safeName);
          resolve(await this.start());
        }
      };
      this.java.once("close", closeHandler);
      this.java.stderr.on("data", errListener);
      this.java.stdout.on('data', startUpListener);
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
