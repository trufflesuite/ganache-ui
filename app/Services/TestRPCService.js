import BlockFetcher from './TestRPCService/BlockFetcher'
import AccountDetailFetcher from './TestRPCService/AccountDetailFetcher'
import TxFetcher from './TestRPCService/TxFetcher'
import TestRPC from 'ganache-core'

import EventEmitter from 'events'
import autobind from 'class-autobind'

export default class TestRPCService extends EventEmitter {
  constructor (ipcMain, webView) {
    super()
    this.ipcMain = ipcMain
    this.webView = webView

    this.testRpc = null
    this.web3 = null
    this.host = null
    this.port = null
    this.stateManager = null
    this.blockFetcher = null

    autobind(this)

    console.log('Starting TestRPCService')

    ipcMain.on('APP/STARTRPC', this._handleStartTestRpc)
    ipcMain.on('APP/GETBLOCKCHAINSTATE', this._handleGetBlockchainState)
    ipcMain.on('APP/STARTMINING', this._handleStartMining)
    ipcMain.on('APP/STOPMINING', this._handleStopMining)
    ipcMain.on('APP/FORCEMINE', this._handleForceMine)
    ipcMain.on('APP/MAKESNAPSHOT', this._handleMakeSnapshot)
    ipcMain.on('APP/REVERTSNAPSHOT', this._handleRevertSnapshot)
    ipcMain.on('APP/ADDACCOUNT', this._handleAddAccount)

    ipcMain.on('APP/SEARCHBLOCK', this._handleBlockSearch)
  }

  log = (message) => {
    console.log(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'log'})
  }

  info = (message) => {
    console.info(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'info'})
  }

  warning = (message) => {
    console.warning(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'warning'})
  }

  error = (message) => {
    console.error(message)
    this.webView.send('APP/TESTRPCLOG', {message, level: 'error'})
  }

  async _handleBlockSearch (event, arg) {
    console.log(`Search for block: ${arg}`)
    const block = await this.blockFetcher.getBlockByNumber(arg)
    console.log('block: ', block)
    this.webView.send('APP/BLOCKSEARCHRESULT', block)
  }

  _handleStartMining = (event, arg) => {
    this.log('Starting Mining....')
    this.stateManager.startMining(this._handleGetBlockchainState)
  }

  _handleStopMining = (event, arg) => {
    this.log('Stopping Mining....')
    this.stateManager.stopMining(this._handleGetBlockchainState)
  }

  _handleForceMine = (event, arg) => {
    this.log('Forcing Mine....')
    this.stateManager.processBlocks(1, this._handleGetBlockchainState)
  }

  _handleMakeSnapshot = (event, arg) => {
    this.log('Making Snapshot...')
    this.stateManager.snapshot()
  }

  _handleRevertSnapshot = (event, arg) => {
    this.log(`Reverting Snapshot #${arg}...`)
    this.stateManager.revert(arg)
  }

  _handleAddAccount = (event, arg) => {
    this.log('Adding account...')
    const newAccount = this.stateManager.createAccount(arg)
    this.stateManager.accounts[newAccount.address] = newAccount
    if (!this.stateManager.secure) {
      this.stateManager.unlocked_accounts[newAccount.address] = newAccount
    }
    this.log('...account added: ' + newAccount.address)
  }

  async _handleGetBlockchainState () {
    let blockChainState = await this._getBlockchainState()
    this.webView && this.webView.send('APP/BLOCKCHAINSTATE', blockChainState)
  }

  _handleStartTestRpc (event, arg) {
    arg.logger = this

    if (this.testRpc) {
      console.log('TESTRPC ALREADY RUNNING ON PORT ' + arg.port)
      return
    }

    this.testRpc = TestRPC.server(arg)
    this.testRpc.listen(arg.port, async (err, stateManager) => {
      if (err) {
        this.webView.send('APP/FAILEDTOSTART', err)
        console.log('ERR: ', err)
      }

      this.port = arg.port
      this.host = 'localhost'
      this.stateManager = stateManager
      this.blockFetcher = new BlockFetcher(this.stateManager)
      this.accountFetcher = new AccountDetailFetcher(this.stateManager)
      this.txFetcher = new TxFetcher(this.stateManager)

      const blockChainState = await this._getBlockchainState()
      this.webView.send('APP/TESTRPCSTARTED', blockChainState)

      this.log('TESTRPC STARTED')
      this.emit('testRpcServiceStarted', this)
      this.refreshTimer = setInterval(this._handleGetBlockchainState, 1000)
    })
  }

  async _getBlockchainState () {
    const currentBlockNumber = await this.blockFetcher.getCurrentBlockNumber()
    let blockChainState = await this.blockFetcher.buildBlockChainState(this.txFetcher._marshallTransaction)

    blockChainState.transactions = await this.txFetcher.getRecentTransactions(currentBlockNumber, this.blockFetcher)
    blockChainState.accounts = await this.accountFetcher.getAccountInfo()
    return blockChainState
  }
}
