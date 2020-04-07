/* global __static:readonly */

import EventEmitter from "events";
import { fork } from "child_process";
import path from "path";
import cloneDeep from "lodash.clonedeep";

// https://github.com/electron/electron/blob/cd0aa4a956cb7a13cbe0e12029e6156c3e892924/docs/api/process.md#process-object
const CHAIN_PATH = path.join(__static, "node", "chain", "chain.js");
const CHAIN_OPTIONS = {
  stdio: ["pipe", "pipe", "pipe", "ipc"],
  execArgv: process.env.NODE_ENV === "development" ? ["--inspect=40895"] : undefined
};

/**
 * Provides an API to Ganache for managing the blockchain, encapsulating the
 * concerns of managing and monitoring of the child blockchain process,
 * interpreting messages from that child process, and solving any data
 * representation mismatches between Ganache and the child process.
 */
class EthereumChainService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  start() {
    if (this._child && this._child.connected) {
      this.emit("message", "start");
    } else {
      const child = this._child = fork(CHAIN_PATH, [], CHAIN_OPTIONS);
      child.on("message", (msg) => {
        if (!msg || !msg.type){
          return;
        }

        const {type, data} = msg || {};
        switch (type) {
          case "process-started":
            this.emit("message", "start");
            return;
          case "server-started":
            this._serverStarted = true;
            this.emit(type, data);
            this.emit("message", type, data);
            return;
          case "server-stopped":
            this._serverStarted = false;
            this.emit(type, data);
            return;
          case "db-location":
            this.emit(type, data);
            return;
        }
        this.emit("message", type, data);
      });
      child.on("error", error => {
        this.emit("error", error);
        this.emit("message", "error", error);
      });
      child.on("exit", this._exitHandler);
      child.stdout.on("data", this._stdHandler.bind(this, "stdout"));
      child.stderr.on("data", this._stdHandler.bind(this, "stderr"));
    }
  }

  async startServer(settings) {
    if (this._child) {
      const options = this._ganacheCoreOptionsFromGanacheSettingsObject(settings);
      return new Promise((resolve, reject) => {
        this.once("server-started", resolve);
        this.once("error", reject);
        this._child.send({
          type: "start-server",
          data: options,
        });
      });
    } else {
      throw new Error("Can't start server. Process not started.");
    }
  }

  stopServer() {
    if (this._child && this._child.connected) {
      return new Promise(resolve => {
        this.once("server-stopped", resolve);
        this._child.send({
          type: "stop-server"
        });
      });
    }
  }

  getDbLocation() {
    if (this._child) {
      if (this.isServerStarted()) {
        return new Promise(resolve => {
          this.once("db-location", resolve);
          this._child.send({
            type: "get-db-location",
          });
        });
      } else {
        throw new Error("Can't get db-location. Server not started.");
      }
    } else {
      throw new Error("Can't get db-location. Process not started.");
    }
  }

  async stop() {
    if (this._child) {
      await this.stopServer();
      this._child.removeListener("exit", this._exitHandler);
      this._child.kill("SIGINT");
    }
  }

  isServerStarted() {
    return this._serverStarted;
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
    this._child = null;
    if (code != null) {
      this.emit("message", 
        "error",
        `Blockchain process exited prematurely with code '${code}', due to signal '${signal}'.`,
      );
    } else {
      this.emit("message", 
        "error",
        `Blockchain process exited prematurely due to signal '${signal}'.`,
      );
    }
  }

  _stdHandler (stdio, data) {
    // Remove all \r's and the final line ending
    this.emit("message", 
      stdio,
      data
        .toString()
         // we don't care enough to handling carriage returns :-|
        .replace(/\r/g, "")
    );
  }
}

export default EthereumChainService;
