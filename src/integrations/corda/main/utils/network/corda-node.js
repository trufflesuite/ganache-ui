const StreamingMessageHandler = require("./streaming-message-handler");
const { exec,spawn } = require("child_process");
const { ipcMain } = require("electron");
const { join } = require("path");
const { SSH_RESIZE } = require("../../../../../common/redux/cordashell/actions");
const SSH = require("./ssh");
const noop = () => {};


class CordaNode {
    constructor(entity, path, JAVA_HOME, CORDA_JAR, io) {
    this.entity = entity;
    this.path = path;
    this.JAVA_HOME = JAVA_HOME;
    this.CORDA_JAR = CORDA_JAR;
    this.java = null;
    this._io = io;
    this.ssh = null;
    this.shell = null;
    this.shuttingDown = false;

    this.earlyCloseHandler = this.earlyCloseHandler.bind(this)
    this.handleStartShell = this.handleStartShell.bind(this)
    this.handleXtermData = this.handleXtermData.bind(this)
    this.handleSshResize = this.handleSshResize.bind(this)

    this._dataHandler = new StreamingMessageHandler();
    this._dataHandler.addErrHandler("CAPSULE EXCEPTION: Capsule not extracted.", this.handleCapsuleError.bind(this));
    this._dataHandler.addOutHandler("Failed to bind on an address in ", this.handlePortBindError.bind(this));
    this._dataHandler.addOutHandler("Failed to bind on address ", this.handlePortBindError.bind(this));
    this._dataHandler.addOutHandler("is installed multiple times on the node.", this.handleDuplicateCordappError.bind(this));
    this._dataHandler.addOutHandler('" started up and registered in ', this.handleStartUp.bind(this))

    this._javaPath = join(this.JAVA_HOME, "bin", "java");
    this._args = ["-jar", this.CORDA_JAR, "--base-directory", this.path, "--no-local-shell", "--log-to-console", "--dev-mode"]
    this._opts = {
      cwd: this.path,
      env: null
    };

    if (process.platform === "win32") {
      // on Windows node can't seem to kill the grandchild process via java.kill,
      // it just orphans it :-/
      this.kill = (java) => exec(`taskkill /pid ${java.pid} /t /f`);
    } else {
      this.kill = (java) => java.kill();
    }

    this._awaiter = {resolve: noop, reject: noop};
  }

  status = "stopped";
  _startPromise = null;
  _stopPromise = null;

  async start() {
    // if we are currently stopping, wait for that to finish before attempting to start
    if (this.status === "stopping") await this._stopPromise;

    // if we are already started or currently starting return the existing promise
    if (this.status === "started" || this.status === "starting") return this._startPromise;

    return this._startPromise = new Promise((resolve, reject) => {
      this.status = "starting";
      this.shuttingDown = false;
      this._stopPromise = null;
      this._awaiter = {resolve, reject};

      this.java = spawn(this._javaPath, this._args, this._opts);
      this._dataHandler.bind(this.java);
      //#region Logging
      this.recordStd = true;
      this.stderr = "";
      this.stdout = "";
      /* eslint-disable no-console */
      this.java.stderr.on("data", (data) => {
        this._io.sendStdErr(data, this.entity.safeName);
        if (this.recordStd) {
          this.stderr += data.toString();
        }
        console.error(`corda stderr:\n${data}`);
      });
      this.java.stdout.on("data", (data) => {
        this._io.sendStdOut(data, this.entity.safeName);
        if (this.recordStd) {
          this.stdout += data.toString();
        }
        console.log(`corda stdout:\n${data}`);
      });
      this.java.on("error", console.error);
      /* eslint-enable no-console */
      //#endregion

      this.java.once("close", this.earlyCloseHandler);
    });
  }
  /**
   * Stops the running corda node. If corda is currently "starting" it will
   * wait for it to start up before shutting down.
   * @param {*} failedStartup set to `true` if stop should be called without waiting for startup.
   */
  async stop(failedStartup = false) {
    // make sure us stopping a node early doesn't trigger an early close error
    this.java && this.java.off("earlyCloseHandler", this.earlyCloseHandler);

    // if we are currently starting up, wait for that to finish before attempting to stop
    if (!failedStartup && this.status === "starting") {
      await this._startPromise
        // ignore startup errors because we want to stop things anyway
        .catch(e => e);
    }

    // don't stop again if we are "stopping" or "stopped" already
    if (this.status === "stopping" || this.status === "stopped") return this._stopPromise;

    ipcMain.off("startShell", this.handleStartShell);
    ipcMain.off("xtermData", this.handleXtermData);
    ipcMain.off(SSH_RESIZE, this.handleSshResize);
    // clean up bound std handlers
    this._dataHandler.unbind();
    this._startPromise = null;
    const java = this.java;

    // we weren't started in the first place, just return right away
    if (!java || java.exitCode !== null || java.signalCode !== null) {
      this.status = "stopped";
      this.shuttingDown = false;
      this.java = null;
      this.ssh = null;
      this.shell = null;
      return this._stopPromise = Promise.resolve();
    }

    this.status = "stopping";
    this.shuttingDown = false;
    // eslint-disable-next-line no-async-promise-executor
    return this._stopPromise = new Promise(async (resolve, reject) => {
      const finish = () => {
        clearTimeout(rejectTimeout);
        clearTimeout(killTimer);
        this.status = "stopped";
        this.shuttingDown = false;
        this.java = null;
        this.ssh = null;
        this.shell = null;
        resolve();
      };
      java.once("close", finish);

      let killTimer;
      // if it hasn't died after 30 seconds kill it with fire
      killTimer = setTimeout(this.kill.bind(this, java), 30000);
      const rejectTimeout = setTimeout(() => {
        // if we're in here this is REALLY bad. We couldn't stop corda after 120 seconds!
        java.off("close", finish);
        clearTimeout(killTimer);
        reject(new Error(`Couldn't stop corda process chain with PID ${java.pid}. This like means you'll need to end processes manual or restart your computer. Please report this issue!`));
      }, 120000);

      // if ssh has started and has a connection
      // use it to shutdown the node
      if (this.ssh && this.ssh.hasConnection()) {
        if (this.shell) {
          await this.shell.disconnect();
        }
        this.ssh.gracefulShutdown(this.kill.bind(this, java));
      } else {
        // somehow we got here without an ssh connection, which is weird, but
        // technically possible if we DID have a connection that soon failed.
        // So... just try killing the process now.
        this.kill(java);
      }
    });
  }

  async earlyCloseHandler(code) {
    if (this.status === "started") {
      // looks like the user shut this node down. tell the UI about it.
      await this.stop();
      this._io.emit("send", "NODE_STOPPED", this.entity.safeName);
      ipcMain.once("START_NODE:" + this.entity.safeName, async () => {
        this._io.emit("send", "NODE_STARTING", this.entity.safeName);
        await this.start(this);
        await this._io.sendClearTerm({
          node: this.entity.safeName
        });
        this.handleStartShell(null, {node: this.entity.safeName});
        this._io.emit("send", "NODE_STARTED", this.entity.safeName);
      });
    } else {
      // eslint-disable-next-line no-console
      console.log("corda", `child process exited with code ${code}`);
      const reject = this._awaiter.reject;

      await this.stop(true).catch(e => e);
      reject(new Error(`corda.jar child process exited with code ${code}.\n\nStderr:\n${this.stderr}\n\nStdout:\n${this.stdout}`));
    }
  }

  handleSshResize (_event, data){
    this.shellDimensions = data;
    this._shellProm.then((shell) => shell && shell.resize(data));
  }

  handleXtermData(_event, { node, data }){
    if (node !== this.entity.safeName) return;

    this._shellProm.then(shell => {
      shell && shell.write(data);
    });
  }

  async handleStartShell(_event, {node}) {
    if (node === this.entity.safeName) {
      ipcMain.off("startShell", this.handleStartShell);

      let shell = this.shell;
      if (!shell) {
        shell = this.shell = new SSH(this.entity.sshdPort);
      }
      shell.connect(true).then(() => {
        this._shellConnectResolver(shell);
        shell.onData(data => {
          this._io.sendSSHData({ node, data });
        });
        ipcMain.on("xtermData", this.handleXtermData);
        shell.on("error", (e) => {
          // swallow errors because we're (probably) just shutting down:
          // eslint-disable-next-line no-console
          console.log(e);
        });
        shell.on("close", () => {
          ipcMain.removeListener(SSH_RESIZE, this.handleSshResize);
          ipcMain.removeListener("xtermData", this.handleXtermData);
          // if the node is shutting down don't restart!
          if (this.shuttingDown) {
            this.shell = null;
            this._shellProm = Promise.resolve();
          } else {
            this.shell = new SSH(this.entity.sshdPort);
            this._shellProm = new Promise(resolve => {
              this._shellConnectResolver = resolve;
            });
            this._io.sendClearTerm({
              node: this.entity.safeName
            });
            this.handleStartShell(null, {node: this.entity.safeName});
          }
        });
        if (this.shellDimensions) {
          this._shellProm.then(shell => shell && shell.resize(this.shellDimensions));
        }
      }).catch((reason) => {
        // eslint-disable-next-line no-console
        console.log(reason);
      });
    }
  }

  async shuttingDownHandler(){
    this.shuttingDown = true;
  }

  _shellProm = Promise.resolve();
  _shellConnectResolver = ()=>{};
  async handleStartUp() {
    const { resolve, reject } = this._awaiter;

    this._dataHandler.unbind();
    this._dataHandler.addOutHandler("Waiting for pending flows to complete before shutting down.", this.shuttingDownHandler.bind(this));
    this._dataHandler.addOutHandler("Executing command \"run shutdown\"", this.shuttingDownHandler.bind(this));
    this._dataHandler.bind(this.java);

    this.ssh = new SSH(this.entity.sshdPort);
    this.shell = new SSH(this.entity.sshdPort);
    try {
      const [conn] = await Promise.all([this.ssh.connect()]);
      this._shellProm = new Promise((resolve)=>{
        this._shellConnectResolver = resolve;
      });

      ipcMain.on("startShell", this.handleStartShell);
      ipcMain.on(SSH_RESIZE, this.handleSshResize);

      this.status = "started";
      this.shuttingDown = false;
      resolve(conn);
    } catch(e) {
      await this.stop(true);
      reject(e);
    }
  }

  async handleCapsuleError() {
    const resolve = this._awaiter.resolve;

    this.java.off("earlyCloseHandler", this.earlyCloseHandler);
    this.stop(true).then(async () => {
      this._io.sendStdErr("Recovering from CAPSULE EXCEPTION...", this.entity.safeName);
      const ssh = await this.start();
      resolve(ssh);
    });
    return true;
  }

  async handleDuplicateCordappError(data) {
    const reject = this._awaiter.reject;
     // We're goin to reject soon enough.
     // so make rejection a `noop` if anything else fails before we do
    this._awaiter.reject = noop;
    
    this.java.off("close", this.earlyCloseHandler);
    this
      .stop(true)
      .catch(noop).then(() => {
        const error = new Error("There was a cordapp issue!");
        error.code = "CUSTOMERROR";
        error.tab = "server";
        error.key = "workspace.project";
        error.message = error.value = `Could not start Corda node ${this.entity.safeName} - duplicate cordapp jar detected. Details: \n${data.toString().trim()}`;
        reject(error);
      });
    return true;
  }

  async handlePortBindError(data) {
    const reject = this._awaiter.reject;
     // We're goin to reject soon enough.
     // so make rejection a `noop` if anything else fails before we do
    this._awaiter.reject = noop;
    
    this.java.off("close", this.earlyCloseHandler);
    this
      .stop(true)
      .catch(noop).then(() => {
        const error = new Error("There was a port issue!");
        error.code = "CUSTOMERROR";
        error.tab = "nodes";
        error.key = "nodes.nodeConfig";
        error.message = error.value = `Could not start Corda node ${this.entity.safeName} - a port is already in use. Fix conflict or edit node configuration before restarting. Details: \n${data.toString().trim()}`;
        reject(error);
      });
    return true;
  }
}

module.exports = CordaNode;
