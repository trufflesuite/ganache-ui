import Repl from 'repl'
import EventEmitter from 'events'

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
    const web3InitScript = `
      var Web3 = require('web3');
      var httpProvider = new Web3.providers.HttpProvider('http://${testRpcService.host}:${testRpcService.port}');
      httpProvider.send = function () { console.log('Synchronous methods are not allowed since they would freeze the NodeJS process and make you think the App had crashed. Dont use synchronous methods in Node.'); return null; }
      var web3 = new Web3(httpProvider);

      web3.eth.getAccounts((err, accounts) => {
        global.totalAccounts = accounts.length
        accounts.map((account, index) => {
          global['account'+index] = account
        })
      })

      global.etherBalance = function(contract) {
        switch(typeof(contract)) {
          case "object":
            if(contract.address) {
              return web3.eth.getBalance(contract.address, (err, balance) => {
                console.log( web3.fromWei(balance, 'ether').toNumber())
              })
            } else {
              return new Error("cannot call getEtherBalance on an object that does not have a property 'address'")
            }
            break
          case "string":
            return web3.eth.getBalance(contract, (err, balance) => {
              console.log( web3.fromWei(balance, 'ether').toNumber())
            })
            break
        }
      }
    `

    this.replStream.emit('data', web3InitScript)
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
