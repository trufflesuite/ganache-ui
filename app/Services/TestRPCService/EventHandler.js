import autobind from 'class-autobind'
import FindProcess from 'find-process'

import SettingsService from '../SettingsService'

export default class EventHandler {
  constructor (testRpcService) {
    this.testRpcService = testRpcService

    autobind(this)

    this.testRpcService.ipcMain.on('APP/STARTRPC', this._handleStartTestRpc)
    this.testRpcService.ipcMain.on('APP/RESTARTRPC', this._handleRestartTestRpc)
    this.testRpcService.ipcMain.on(
      'APP/GETBLOCKCHAINSTATE',
      this._handleGetBlockchainState
    )
    this.testRpcService.ipcMain.on('APP/STARTMINING', this._handleStartMining)
    this.testRpcService.ipcMain.on('APP/STOPMINING', this._handleStopMining)
    this.testRpcService.ipcMain.on('APP/FORCEMINE', this._handleForceMine)
    this.testRpcService.ipcMain.on('APP/MAKESNAPSHOT', this._handleMakeSnapshot)
    this.testRpcService.ipcMain.on(
      'APP/REVERTSNAPSHOT',
      this._handleRevertSnapshot
    )

    this.testRpcService.ipcMain.on('APP/SEARCHBLOCK', this._handleBlockSearch)
    this.testRpcService.ipcMain.on('APP/SEARCHTX', this._handleTxSearch)

    this.testRpcService.ipcMain.on('APP/CHECKPORT', this._handleCheckPort)

    this.testRpcService.ipcMain.on('APP/GETSETTINGS', this._getSettings)
    this.testRpcService.ipcMain.on('APP/SETSETTINGS', this._setSettings)

    this.testRpcService.ipcMain.on(
      'APP/GETCONSOLEMESSAGES',
      this._getConsoleMessages
    )
  }

  _getConsoleMessages = (event, arg) => {
    this.testRpcService.webView.send(
      'APP/REPLSTATE',
      this.testRpcService.consoleService.getPendingMessageBuffer()
    )
  }

  _getSettings = async (event, arg) => {
    const settings = new SettingsService().getAll()
    this.testRpcService.webView.send('APP/SETTINGS', settings)
  }

  _setSettings = async (event, arg) => {
    const settings = new SettingsService()
    settings.setAll(arg)
  }

  _handleBlockSearch = async (event, arg) => {
    const block = await this.testRpcService.blockFetcher.getBlockByNumber(arg)
    this.testRpcService.webView.send('APP/BLOCKSEARCHRESULT', block)
  }

  _handleTxSearch = async (event, arg) => {
    const tx = await this.testRpcService.txFetcher.getTxByHash(arg)
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
    this.testRpcService.stateManager.processBlocks(
      1,
      this._handleGetBlockchainState
    )
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

  async _handleGetBlockchainState () {
    if (!this.testRpcService.blockFetcher) {
      return
    }

    let blockChainState = await this.testRpcService.blockFetcher.getBlockchainState()
    this.testRpcService.webView &&
      this.testRpcService.webView.send('APP/BLOCKCHAINSTATE', blockChainState)
  }

  _handleStartTestRpc (event, arg) {
    arg.logger = this.testRpcService

    if (this.testRpcService.testRpc) {
      console.log('TESTRPC ALREADY RUNNING ON PORT ' + arg.port)
      return
    }

    this.testRpcService.initializeTestRpc(arg)
  }

  _handleRestartTestRpc (event, arg) {
    console.log('RESTARTING TESTRPC ON PORT ' + arg.port)
    arg.logger = this.testRpcService
    this.testRpcService.initializeTestRpc(arg)
  }

  async _handleCheckPort (event, port) {
    let result = await FindProcess('port', port).then(list => {
      if (!list.length) {
        return {
          status: 'clear'
        }
      } else {
        return {
          status: 'blocked',
          pid: list
        }
      }
    })

    this.testRpcService.webView &&
      this.testRpcService.webView.send('APP/CHECKPORTRESULT', result)
  }
}
