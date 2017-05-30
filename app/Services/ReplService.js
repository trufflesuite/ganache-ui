import Repl from 'repl'
import EventEmitter from 'events'

import Web3 from 'web3'

import Web3InitScript from './ReplService/Web3InitScript'

class ReplStream extends EventEmitter {
  constructor (webView) {
    super()

    this.readable = true
    this.writeable = true

    this.webView = webView

    this.streamOpen = true
  }

  closeStream () {
    this.streamOpen = false
  }

  openStream () {
    this.streamOpen = true
  }

  write (data) {
    console.log(data)
    if (data !== '' && this.streamOpen) {
      this.webView.send('APP/REPLSTATE', data.trim())
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
    this.replStream.closeStream()

    this._repl = Repl.start({
      prompt: '',
      input: this.replStream,
      output: this.replStream
    })

    ipcMain.on('APP/SENDREPLCOMMAND', this.sendReplInput)
    ipcMain.on('APP/SENDREPLCOMMANDCOMPLETION', this._handleCommandCompletion)

    this.testRpcService.on('testRpcServiceStarted', this._handleStartTestRpc)
  }

  _handleStartTestRpc = (testRpcService) => {
    this._repl.context['Web3'] = Web3
    new Web3InitScript(testRpcService.host, testRpcService.port).exportedScript().then((bootScript) => {
      this.replStream.emit('data', bootScript)
      this.replStream.openStream()
    })
  }

  _handleCommandCompletion = (e, cmd) => {
    this._repl.complete(cmd, (err, completions) => {
      if (err) {
        console.log(err)
      }

      const payload = { 'completions': completions }
      this.webView.send('APP/REPLCOMMANDCOMPLETIONRESULT', payload)
    })
  }

  setReplContextItem = (key, value) => {
    console.log('Setting REPL context: ' + key + '=' + JSON.stringify(value))
    this._repl.context[key] = value
  }

  sendReplInput = (e, input) => {
    if (!input.match(/^\..+/)) {
      this.replStream.emit('data', input + '\n')

      if (input === 'clear()') {
        this.webView.send('APP/REPLCLEAR')
      }
    }
  }
}
