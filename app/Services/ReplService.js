import Repl from 'repl'
import EventEmitter from 'events'

import Web3 from 'web3'

class ReplStream extends EventEmitter {
  constructor (webView) {
    super()

    this.messages = []
    this.readable = true
    this.writeable = true

    this.webView = webView
  }

  write (data) {
    this.messages.push(data)

    if (data !== '') {
      this.webView.send('APP/REPLSTATE', data)
    }
  }
  end () {}

  setEncoding (encoding) {}
  pause () {}
  resume () {}
  destroy () {
    this.messages = null
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
    const chainState = testRpcService._buildBlockChainState()
    this.setReplContextItem('accounts', chainState.accounts.length)
    this.setReplContextItem('web3',
                            new Web3(new Web3.providers.HttpProvider(`http://${testRpcService.host}:${testRpcService.port}`)))
  }

  setReplContextItem = (key, value) => {
    console.log('Setting REPL context: ' + key + '=' + value)
    this._repl.context[key] = value
  }

  getReplContents = () => {
    return this.replStream.messages.shift()
  }

  sendReplInput = (e, input) => {
    console.log(input)
    this.replStream.emit('data', input + '\n')
  }
}
