/* global __static:readonly */

import EventEmitter from "events";


/**
 * Provides an API to Ganache for managing the blockchain, encapsulating the
 * concerns of managing and monitoring of the child blockchain process,
 * interpreting messages from that child process, and solving any data
 * representation mismatches between Ganache and the child process.
 */
export default class RemoteEthereumChainService extends EventEmitter {
  constructor(workspace, config) {
    super();
    this.config = config;
  }

  start() {
    this.emit("message", "start");
  }

  async startServer() {

  }

  stopServer() {

  }

  getDbLocation() {
    return "/";
  }

  async stop() {

  }

  isServerStarted() {
    return true;
  }
}
