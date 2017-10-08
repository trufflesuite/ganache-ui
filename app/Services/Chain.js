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
      stdio: [ 0, 1, 2, 'ipc' ]
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
  }

  startServer(options) {
    this.child.send({
      type: 'start-server',
      data: options
    })
  }
}

export default ChainService