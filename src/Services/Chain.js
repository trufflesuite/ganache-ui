import EventEmitter from 'events'
import { fork } from 'child_process'
import path from 'path'

// https://github.com/electron/electron/blob/cd0aa4a956cb7a13cbe0e12029e6156c3e892924/docs/api/process.md#process-object

class ChainService extends EventEmitter {
  constructor(app) {
    super()
    this.app = app
    this.child = null
    this.lastHeartBeat = new Date().getTime()
    this.serverStarted = false
  }

  start() {
    let chainPath = path.join(__dirname, "../", "chain.js")
    const options = {
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
    };
    this.child = fork(chainPath, [], options)
    this.child.once('message', () => {
      this.emit("start")
    })
    this.child.on('message', (message) => {
      if (message.type == "heartbeat") {
        this.lastHeartBeat = new Date().getTime()
      }
      if (message.type == "server-started") {
        this.serverStarted = true
      }
      if (message.type == "server-stopped") {
        this.serverStarted = false
      }
      this.emit(message.type, message.data)
    })
    this.child.on('error', (error) => {
      this.emit("error", error.stack || error)
    })
    this.child.stdout.on('data', (data) => {
      // Remove all \r's and the final line ending
      this.emit("stdout", data.toString().replace(/\r/g, "").replace(/\n$/, ""))
    });
    this.child.stderr.on('data', (data) => {
      // Remove all \r's and the final line ending
      this.emit("stderr", data.toString().replace(/\r/g, "").replace(/\n$/, ""))
    });

    // Check to see if we lost the process's heartbeat
    // Necessary? Who knows, but we want to know if it happens.

    setInterval(() => {
      var now = new Date().getTime()
      // If we didn't receive a heartbeat in the last five seconds, error.
      if (this.lastHeartBeat < now - 5000) {
        this.emit("error", new Error("Lost heartbeat from server process!"))
      }
    }, 5000)
  }

  startServer(options) {
    this.child.send({
      type: 'start-server',
      data: options
    })
  }

  stopServer(options) {
    this.child.send({
      type: 'stop-server',
    })
  }

  stopProcess() {
    if (this.child) {
      this.child.kill('SIGHUP');
    }
  }

  isServerStarted() {
    return this.isServerStarted
  }
}

export default ChainService
