import EventEmitter from "events";
import { fork } from "child_process";
import path from "path";
import cloneDeep from "lodash.clonedeep";

// https://github.com/electron/electron/blob/cd0aa4a956cb7a13cbe0e12029e6156c3e892924/docs/api/process.md#process-object

/**
 * Provides an API to Ganache for managing the blockchain, encapsulating the
 * concerns of managing and monitoring of the child blockchain process,
 * interpreting messages from that child process, and solving any data
 * representation mismatches between Ganache and the child process.
 */
class ChainService extends EventEmitter {
  constructor() {
    super();
    this.child = null;
    this.serverStarted = false;
    this.setMaxListeners(1);
  }

  start() {
    if (this.child === null) {
      let chainPath = path.join(__dirname, "../../chain/", "chain.js");
      const options = {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      };
      this.child = fork(chainPath, [], options);
      this.child.on("message", message => {
        if (message.type == "process-started") {
          this.emit("start");
        }
        if (message.type == "server-started") {
          this.serverStarted = true;
        }
        if (message.type == "server-stopped") {
          this.serverStarted = false;
        }
        this.emit(message.type, message.data);
      });
      this.child.on("error", error => {
        this.emit("error", error);
      });
      this.child.on("exit", this._exitHandler);
      this.child.stdout.on("data", data => {
        // Remove all \r's and the final line ending
        this.emit(
          "stdout",
          data
            .toString()
            .replace(/\r/g, "")
            .replace(/\n$/, ""),
        );
      });
      this.child.stderr.on("data", data => {
        // Remove all \r's and the final line ending
        this.emit(
          "stderr",
          data
            .toString()
            .replace(/\r/g, "")
            .replace(/\n$/, ""),
        );
      });
    } else {
      this.emit("start");
    }
  }

  startServer(settings) {
    if (this.child !== null) {
      let options = this._ganacheCoreOptionsFromGanacheSettingsObject(settings);
      this.child.send({
        type: "start-server",
        data: options,
      });
    }
  }

  stopServer() {
    return new Promise(resolve => {
      this.once("server-stopped", () => {
        resolve();
      });
      if (this.child !== null) {
        this.child.send({
          type: "stop-server",
        });
      } else {
        resolve();
      }
    });
  }

  getDbLocation() {
    return new Promise(resolve => {
      this.once("db-location", location => {
        resolve(location);
      });
      if (this.child !== null) {
        this.child.send({
          type: "get-db-location",
        });
      } else {
        resolve(undefined);
      }
    });
  }

  stopProcess() {
    if (this.child !== null) {
      this.child.removeListener("exit", this._exitHandler);
      if (this.child) {
        this.child.kill("SIGINT");
      }
    }
  }

  isServerStarted() {
    return this.serverStarted;
  }

  /**
   * Returns an options object to be used by ganache-core from Ganache settings
   * model. Should be broken out to call multiple functions if it becomes even
   * moderately complex.
   */
  _ganacheCoreOptionsFromGanacheSettingsObject(settings) {
    // clone to avoid mutating the settings object in case it's sent elsewhere
    let options = cloneDeep(settings.server);

    if (settings.randomizeMnemonicOnStart) {
      delete options.mnemonic;
    }

    options.logDirectory = settings.logDirectory;

    return options;
  }

  _exitHandler(code, signal) {
    if (code != null) {
      this.emit(
        "error",
        `Blockchain process exited prematurely with code '${code}', due to signal '${signal}'.`,
      );
    } else {
      this.emit(
        "error",
        `Blockchain process exited prematurely due to signal '${signal}'.`,
      );
    }
  }
}

export default ChainService;
