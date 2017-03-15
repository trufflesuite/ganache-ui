import Repl from 'repl'
import EventEmitter from 'events'

import Web3InitScript from './ReplService/Web3InitScript'

class ReplStream extends EventEmitter {
  constructor (webView) {
    super()

    this.readable = true
    this.writeable = true

    this.webView = webView
  }

  write (data) {
    if (data !== '') {
      this.webView.send('APP/REPLSTATE', data)
    }
  }
  end () {}

  setEncoding (encoding) {}
  pause () {}
  resume () {}
  destroy () {
    this.webView = null
  }
  destroySoon () {}

}

export default class ReplService {
  constructor (ipcMain, webView, testRpcService) {
    this.testRpcService = testRpcService
    this.ipcMain = ipcMain
    this.webView = webView
    this.replStream = new ReplStream(webView)

    this._repl = Repl.start({
      prompt: '',
      input: this.replStream,
      output: this.replStream
    })

    ipcMain.on('APP/SENDREPLCOMMAND', this.sendReplInput)

    this.testRpcService.on('testRpcServiceStarted', this._handleStartTestRpc)
  }

  _handleStartTestRpc = (testRpcService) => {
    new Web3InitScript(testRpcService.host, testRpcService.port).exportedScript().then((bootScript) => {
      this.replStream.emit('data', bootScript)
    })
  }

  setReplContextItem = (key, value) => {
    console.log('Setting REPL context: ' + key + '=' + JSON.stringify(value))
    this._repl.context[key] = value
  }

  getReplContents = () => {
    return this.replStream.messages.shift()
  }

  sendReplInput = (e, input) => {
    this.replStream.emit('data', input + '\n')
  }
}
