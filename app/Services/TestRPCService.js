import EventHandler from './TestRPCService/EventHandler'
import EventEmitter from 'events'
import TestRPC from 'ganache-core'
import BlockFetcher from './TestRPCService/BlockFetcher'
import AccountDetailFetcher from './TestRPCService/AccountDetailFetcher'
import TxFetcher from './TestRPCService/TxFetcher'
import autobind from 'class-autobind'

export default class TestRPCService extends EventEmitter {
  constructor (ipcMain, webView, consoleService) {
    super()
    this.ipcMain = ipcMain
    this.webView = webView
    this.consoleService = consoleService

    this.testRpc = null
    this.web3 = null
    this.host = null
    this.port = null
    this.stateManager = null
    this.blockFetcher = null
    this.txFetcher = null
    this.accountFetcher = null

    this.eventHandler = new EventHandler(this)

    autobind(this)
    console.log('🍪  Starting Ganache Core')
  }

  log = message => {
    this.consoleService.log(message)
  }

  info = message => {
    this.consoleService.info(message)
  }

  warning = message => {
    this.consoleService.warning(message)
  }

  error = message => {
    this.consoleService.error(message)
  }

  initializeTestRpc = opts => {
    if (this.testRpc) {
      this.testRpc.close(err => {
        if (err) {
          console.log(err)
        }

        this.testRpc = TestRPC.server(opts)
        this.startServer(opts)
      })
    } else {
      this.testRpc = TestRPC.server(opts)
      this.startServer(opts)
    }
  }

  startServer = opts => {
    this.testRpc.listen(opts.port, opts.hostname, async (err, stateManager) => {
      if (err) {
        this.testRpcService.webView.send('APP/FAILEDTOSTART', err)
        console.log('ERR: ', err)
      }

      this.consoleService.initializeWeb3Scripts(opts.hostname, opts.port)

      this.port = opts.port
      this.host = opts.hostname
      this.stateManager = stateManager
      this.txFetcher = new TxFetcher(this.stateManager)
      this.blockFetcher = new BlockFetcher(this.stateManager, this)
      this.accountFetcher = new AccountDetailFetcher(this.stateManager)

      const blockChainState = await this.blockFetcher.getBlockchainState()
      this.webView.send('APP/TESTRPCSTARTED', blockChainState)

      this.emit('testRpcServiceStarted', this)
      this.log(`GANACHE STARTED: LISTENING ON http://${this.host}:${this.port}`)
    })
  }
}
