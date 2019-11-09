import EventEmitter from "events";
import { fork } from "child_process";
import { join } from "path";
import { app } from "electron";

// https://github.com/electron/electron/blob/cd0aa4a956cb7a13cbe0e12029e6156c3e892924/docs/api/process.md#process-object

class TruffleIntegrationService extends EventEmitter {
  constructor(isDevMode) {
    super();
    this.child = null;
    this.isDevMode = isDevMode;
    this.setMaxListeners(1);
  }

  start() {
    if (this.child) {
      this.emit("start");
    } else {
      let chainPath = join(
        __static,
        "node",
        "truffle-integration",
        "index.js",
      );
      const options = {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
        env: {
          ...process.env,
          ELECTRON_APP_PATH: app.getAppPath(),
          GANACHE_DEV_MODE: this.isDevMode,
        },
      };
      const forkArgs = process.env.NODE_ENV === "development" ? ["--inspect", 5860] : [];
      this.child = fork(chainPath, forkArgs, options);
      this.child.on("message", message => {
        if (message.type == "process-started") {
          this.emit("start");
        }
        this.emit(message.type, message.data);
      });
      this.child.on("error", error => {
        console.log(error);
        this.emit("error", error);
      });
      this.child.on("exit", this._exitHandler);
      this.child.stdout.on("data", this._handleStd);
      this.child.stderr.on("data", this._handleStd);
    }
  }

  stopProcess() {
    if (this.child !== null) {
      this.child.removeListener("exit", this._exitHandler);
      if (this.child.connected) {
        try {
          this.child.kill("SIGINT");
        } catch(e){
          // ignore, child is likely already killed.
        }
      }
      this.child = null;
    }
  }

  async stopWatching() {
    return new Promise(resolve => {
      this.once("watcher-stopped", resolve);

      if (this.child !== null && this.child.connected) {
        this.child.send({
          type: "watcher-stop",
          data: null,
        });
      } else {
        resolve();
      }
    });
  }

  _exitHandler(code, signal) {
    if (code != null) {
      this.emit(
        "error",
        `Truffle Integration process exited prematurely with code '${code}', due to signal '${signal}'.`,
      );
    } else {
      this.emit(
        "error",
        `Truffle Integration process exited prematurely due to signal '${signal}'.`,
      );
    }
  }

  _handleStd(data){
    console.log(data.toString());
    // Remove all \r's and the final line ending
    this.emit(
      "stdout",
      data
        .toString()
        .replace(/\r/g, "")
        .replace(/\n$/, ""),
    );
  }

  async getProjectDetails(projectConfigFile, networkId) {
    return new Promise((resolve, reject) => {
      this.once("project-details-response", details => {
        resolve(details);
      });

      if (this.child !== null && this.child.connected) {
        this.child.send({
          type: "project-details-request",
          data: {
            file: projectConfigFile,
            networkId,
          },
        });
      } else {
        reject(new Error("Not connected to child process"));
      }
    });
  }

  setWeb3(url) {
    if (this.child !== null && this.child.connected) {
      this.child.send({
        type: "web3-provider",
        data: url,
      });
    }
  }

  async getContractState(contract, contracts, block) {
    return new Promise((resolve, reject) => {
      this.once("decode-contract-response", state => {
        if (typeof state === "object") {
          resolve(state);
        } else {
          reject(state);
        }
      });

      if (this.child !== null && this.child.connected) {
        this.child.send({
          type: "decode-contract-request",
          data: { contract, contracts, block },
        });
      } else {
        reject(new Error("Not connected to child process"));
      }
    });
  }

  async getDecodedEvent(contract, contracts, log) {
    return new Promise((resolve, reject) => {
      this.once("decode-event-response", data => {
        if (typeof data === "object") {
          resolve(data);
        } else {
          reject(data);
        }
      });

      if (this.child !== null && this.child.connected) {
        this.child.send({
          type: "decode-event-request",
          data: { contract, contracts, log },
        });
      } else {
        reject(new Error("Not connected to child process"));
      }
    });
  }

  async getDecodedTransaction(contract, contracts, transaction) {
    return new Promise((resolve, reject) => {
      this.once("decode-transaction-response", data => {
        if (typeof data === "object") {
          resolve(data);
        } else {
          reject(data);
        }
      });

      if (this.child !== null && this.child.connected) {
        this.child.send({
          type: "decode-transaction-request",
          data: { contract, contracts, transaction },
        });
      } else {
        reject(new Error("Not connected to child process"));
      }
    });
  }
}

export default TruffleIntegrationService;
