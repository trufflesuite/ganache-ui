import EventEmitter from 'events'
import { fork } from 'child_process'
import path from 'path'

// https://github.com/electron/electron/blob/cd0aa4a956cb7a13cbe0e12029e6156c3e892924/docs/api/process.md#process-object

class ChainService extends EventEmitter {
  constructor(app) {
    super()
    this.app = app
    this.child = null
  }

  start() {
    let chainPath = path.join(this.app.getAppPath(), "chain.js")
    const options = {
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
    };
    this.child = fork(chainPath, [], options)
    this.child.once('message', () => {
      this.emit("start")
    })
    this.child.on('message', (message) => {
      this.emit(message.type, message.data)
    })
    this.child.on('error', (error) => {
      console.log(error)
    })
    this.child.stdout.on('data', (data) => {
      // Remove all \r's and the final line ending
      this.emit("stdout", data.toString().replace(/\r/g, "").replace(/\n$/, ""))
    });
    this.child.stderr.on('data', (data) => {
      // Remove all \r's and the final line ending
      this.emit("stderr", data.toString().replace(/\r/g, "").replace(/\n$/, ""))
    });
  }

  startServer(options) {
    this.child.send({
      type: 'start-server',
      data: options
    })
  }
}

export default ChainService