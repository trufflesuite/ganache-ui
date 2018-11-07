import EventEmitter from 'events'
import { fork } from 'child_process'
import path from 'path'

// https://github.com/electron/electron/blob/cd0aa4a956cb7a13cbe0e12029e6156c3e892924/docs/api/process.md#process-object

class TruffleIntegrationService extends EventEmitter {
  constructor() {
    super()
    this.child = null;
    this.setMaxListeners(1);
  }

  start() {
    let chainPath = path.join(__dirname, "../../truffle-integration/", "index.js");
    const options = {
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
    };
    const args = process.env.NODE_ENV === "production" ? [] : ["--inspect=5858"];
    this.child = fork(chainPath, args, options);
    this.child.on('message', (message) => {
      if (message.type == "process-started") {
        this.emit("start");
      }
      this.emit(message.type, message.data);
    })
    this.child.on('error', (error) => {
      console.log(error);
      this.emit("error", error);
    })
    this.child.on('exit', this._exitHandler);
    this.child.stdout.on('data', (data) => {
      //console.log(data.toString());
      // Remove all \r's and the final line ending
      //this.emit("stdout", data.toString().replace(/\r/g, "").replace(/\n$/, ""));
    });
    this.child.stderr.on('data', (data) => {
      console.log(data.toString());
      // Remove all \r's and the final line ending
      //this.emit("stderr", data.toString().replace(/\r/g, "").replace(/\n$/, ""));
    });
  }

  stopProcess() {
    if (this.child !== null) {
      this.child.removeListener('exit', this._exitHandler);
      if (this.child) {
        this.child.kill('SIGHUP');
      }
    }
  }

  async stopWatching() {
    return new Promise((resolve, reject) => {
      this.once("watcher-stopped", () => {
        resolve();
      });

      this.child.send({
        type: "watcher-stop",
        data: null
      });
    })
  }

  _exitHandler(code, signal) {
    if (code != null) {
      this.emit("error", `Blockchain process exited prematurely with code '${code}', due to signal '${signal}'.`);
    } else {
      this.emit("error", `Blockchain process exited prematurely due to signal '${signal}'.`);
    }
  }

  async getProjectDetails(projectConfigFile) {
    return new Promise((resolve, reject) => {
      this.once("project-details-response", (details) => {
        if (typeof details === "object") {
          resolve(details);
        }
        else {
          reject(details);
        }
      })

      this.child.send({
        type: "project-details-request",
        data: projectConfigFile
      });
    });
  }

  setWeb3(url) {
    this.child.send({
      type: "web3-provider",
      data: url
    });
  }

  async getContractState(contract, contracts, block) {
    return new Promise((resolve, reject) => {
      this.once("decode-contract-response", (state) => {
        if (typeof state === "object") {
          resolve(state);
        }
        else {
          reject(state);
        }
      });

      this.child.send({
        type: "decode-contract-request",
        data: { contract, contracts, block }
      });
    });
  }

  async getDecodedEvent(contract, contracts, log) {
    return new Promise((resolve, reject) => {
      this.once("decode-event-response", (data) => {
        if (typeof data === "object") {
          resolve(data);
        }
        else {
          reject(data);
        }
      });

      this.child.send({
        type: "decode-event-request",
        data: { contract, contracts, log }
      });
    });
  }

  async getDecodedTransaction(contract, contracts, transaction) {
    return new Promise((resolve, reject) => {
      this.once("decode-transaction-response", (data) => {
        if (typeof data === "object") {
          resolve(data);
        }
        else {
          reject(data);
        }
      });

      this.child.send({
        type: "decode-transaction-request",
        data: { contract, contracts, transaction }
      });
    });
  }
}

export default TruffleIntegrationService;
