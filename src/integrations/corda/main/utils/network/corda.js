const { spawn } = require("child_process");
const { join } = require("path");
const node_ssh = require("node-ssh");
const StreamingMessageHandler = require("./streaming-message-handler");
const noop = () => {};

class Corda {
  constructor(entity, path, JAVA_HOME, io) {
    this.entity = entity;
    this.path = path;
    this.JAVA_HOME = JAVA_HOME;
    this.java = null;
    this._io = io;
    this.ssh = null;

    this.closeHandler = this.closeHandler.bind(this)

    this._dataHandler = new StreamingMessageHandler();

    this._awaiter = {resolve: noop, reject: noop};
  }

  status = "stopped"

  start() {
    if (this.status !== "stopped") throw new Error("Corda process must be stopped before starting");

    return new Promise((resolve, reject) => {
      this._awaiter = {resolve, reject};
      this.status = "starting";
      this.java = spawn(join(this.JAVA_HOME, "bin", "java"), ["-jar", "corda.jar"], {cwd: this.path, env: null});

      this._dataHandler.addErrHandler("CAPSULE EXCEPTION: Capsule not extracted.", this.handleCapsuleError.bind(this));
      this._dataHandler.addOutHandler("Failed to bind on an address in ", this.handlePortBindError.bind(this));
      this._dataHandler.addOutHandler('" started up and registered in ', this.handleStartUp.bind(this))

      this._dataHandler.bind(this.java);

      //#region Logging
      /* eslint-disable no-console */
      this.java.stderr.on("data", (data) => {
        this._io.sendStdErr(data, this.entity.safeName);
        console.error(`corda stderr:\n${data}`);
      });
      this.java.stdout.on("data", (data) => {
        this._io.sendStdOut(data, this.entity.safeName);
        console.log(`corda stdout:\n${data}`);
      });
      this.java.on("error", console.error);
      /* eslint-enable no-console */
      //#endregion

      this.java.once("close", ()=>{ this.status = "stopped"; });

      this.java.once("close", this.closeHandler);
    });
  }

  async stop() {
    if (this.status !== "started") return;
    this.status = "stopping";
    this._dataHandler.unbind();
    if (this.ssh) {
      await this.ssh.exec("run", ["gracefulShutdown"]);
      this.ssh = null;
    }
    if (this.java) {
      return new Promise(resolve => {
        if (this.java.exitCode === null) {
          this.java.once("close", () => {
            this.java = null;
            resolve();
          });
          if (!this.java.killed) {
            this.java.kill();
          }
        } else {
          this.java = null;
          resolve();
        }
      });
    }
  }

  async closeHandler(code){
    console.log("corda", `child process exited with code ${code}`);
    await this.stop();
    this._awaiter.reject(new Error(`corda.jar child process exited with code ${code}`));
  }

  async handleStartUp() {
    this.status = "started";

    this.ssh = new node_ssh();

    this._dataHandler.unbind();
    this.java.off("close", this.closeHandler);
    await this.ssh.connect({
      host: "127.0.0.1",
      username: "user1",
      password: "letmein",
      port: this.entity.sshdPort
    });
    this._awaiter.resolve();
  }

  async handleCapsuleError() {
    const resolve = this._awaiter.resolve
    this.java.off("close", this.closeHandler);
    this.stop().then(async () => {
      this._io.sendStdErr("Recovering from CAPSULE EXCEPTION...", this.entity.safeName);
      resolve(await this.start());
    });
    return true;
  }

  async handlePortBindError(data) {
    const reject = this._awaiter.reject;
    
    this.java.off("close", this.closeHandler);
    this.stop().then(() => {
      reject(new Error(data.toString()));
    })
    return true;
  }
}

module.exports = Corda;
