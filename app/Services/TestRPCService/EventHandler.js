import autobind from 'class-autobind'
import SysLog from 'electron-log'

export default class EventHandler {
  constructor (testRpcService) {
    this.testRpcService = testRpcService

    autobind(this)

    this.testRpcService.ipcMain.on('APP/STARTRPC', this._handleStartTestRpc)
    this.testRpcService.ipcMain.on('APP/GETBLOCKCHAINSTATE', this._handleGetBlockchainState)
    this.testRpcService.ipcMain.on('APP/STARTMINING', this._handleStartMining)
    this.testRpcService.ipcMain.on('APP/STOPMINING', this._handleStopMining)
    this.testRpcService.ipcMain.on('APP/FORCEMINE', this._handleForceMine)
    this.testRpcService.ipcMain.on('APP/MAKESNAPSHOT', this._handleMakeSnapshot)
    this.testRpcService.ipcMain.on('APP/REVERTSNAPSHOT', this._handleRevertSnapshot)
    this.testRpcService.ipcMain.on('APP/ADDACCOUNT', this._handleAddAccount)

    this.testRpcService.ipcMain.on('APP/SEARCHBLOCK', this._handleBlockSearch)
    this.testRpcService.ipcMain.on('APP/SEARCHTX', this._handleTxSearch)
  }

  _handleBlockSearch = async (event, arg) => {
    const block = await this.testRpcService.blockFetcher.getBlockByNumber(arg)
    this.testRpcService.webView.send('APP/BLOCKSEARCHRESULT', block)
  }

  _handleTxSearch = async (event, arg) => {
    const tx = await this.testRpcService.txFetcher.getTxByHash(arg)
    console.log(`tx: ${tx}`)
    this.testRpcService.webView.send('APP/TXSEARCHRESULT', tx)
  }

  _handleStartMining = (event, arg) => {
    this.testRpcService.log('Starting Mining....')
    this.testRpcService.stateManager.startMining(this._handleGetBlockchainState)
  }

  _handleStopMining = (event, arg) => {
    this.testRpcService.log('Stopping Mining....')
    this.testRpcService.stateManager.stopMining(this._handleGetBlockchainState)
  }

  _handleForceMine = (event, arg) => {
    this.testRpcService.log('Forcing Mine....')
    this.testRpcService.stateManager.processBlocks(1, this._handleGetBlockchainState)
  }

  _handleMakeSnapshot = (event, arg) => {
    this.testRpcService.log('Making Snapshot...')
    this.testRpcService.stateManager.snapshot((err, cb) => {
      err ? console.log(err) : null
    })
  }

  _handleRevertSnapshot = (event, arg) => {
    this.testRpcService.log(`Reverting Snapshot #${arg}...`)
    this.testRpcService.stateManager.revert(arg, (err, cb) => {
      err ? console.log(err) : null
    })
  }

  _handleAddAccount = (event, arg) => {
    this.testRpcService.log('Adding account...')
    const newAccount = this.testRpcService.stateManager.createAccount(arg)
    console.log(`NEW ACCOUNT: ${newAccount.account.balance}`)
    this.testRpcService.stateManager.accounts[newAccount.address] = newAccount
    if (!this.testRpcService.stateManager.secure) {
      this.testRpcService.stateManager.unlocked_accounts[newAccount.address] = newAccount
    }
    this.testRpcService.log('...account added: ' + newAccount.address)
  }

  async _handleGetBlockchainState () {
    let blockChainState = await this.testRpcService.blockFetcher.getBlockchainState()
    this.testRpcService.webView && this.testRpcService.webView.send('APP/BLOCKCHAINSTATE', blockChainState)
  }

  _handleStartTestRpc (event, arg) {
    arg.logger = this.testRpcService

    if (this.testRpcService.testRpc) {
      console.log('TESTRPC ALREADY RUNNING ON PORT ' + arg.port)
      return
    }

    this.testRpcService.initializeTestRpc(arg)
  }
}
