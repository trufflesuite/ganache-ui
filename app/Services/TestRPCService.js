import BlockFetcher from './TestRPCService/BlockFetcher'
import TestRPC from 'ganache-core'
import BN from 'bn.js'
import ConversionUtils from 'ganache-core/lib/utils/to'

import EventEmitter from 'events'

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

    this._getLatestAccountInfo = this._getLatestAccountInfo.bind(this)
    this._buildBlockChainState = this._buildBlockChainState.bind(this)
    this._handleGetBlockchainState = this._handleGetBlockchainState.bind(this)
    this._handleBlockSearch = this._handleBlockSearch.bind(this)

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
    const block = await this._getBlock(arg)
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

  _handleStartTestRpc = (event, arg) => {
    arg.logger = this

    if (this.testRpc) {
      console.log('TESTRPC ALREADY RUNNING ON PORT ' + arg.port)
      return
    }

    this.testRpc = TestRPC.server(arg)
    this.testRpc.listen(arg.port, (err, stateManager) => {
      if (err) {
        this.webView.send('APP/FAILEDTOSTART', err)
        console.log('ERR: ', err)
      }

      this.port = arg.port
      this.host = 'localhost'
      this.stateManager = stateManager
      this.blockFetcher = new BlockFetcher(this.stateManager, this._marshallTransaction)

      const stateManagerParams = this._buildBlockChainState()

      this.webView.send('APP/TESTRPCSTARTED', stateManagerParams)
      this.log('TESTRPC STARTED')
      this.emit('testRpcServiceStarted', this)
      this.refreshTimer = setInterval(this._handleGetBlockchainState, 1000)
    })
  }

  async _handleGetBlockchainState () {
    const stateManagerParams = await this._buildBlockChainState()
    this.webView && this.webView.send('APP/BLOCKCHAINSTATE', stateManagerParams)
  }

  _getLatestAccountInfo (account) {
    return new Promise((resolve, reject) => {
      this.stateManager.blockchain.getAccount(account, 'latest', (err, res) => {
        if (err) {
          console.log(err)
          reject(err)
        }

        resolve(res)
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  async _buildBlockChainState () {
    const stateManager = this.stateManager

    let accounts = await Promise.all(Object.keys(stateManager.accounts).map(async (address, index) => {
      let latestAccountInfo = await this._getLatestAccountInfo(address)

      return {
        index,
        address,
        balance: new BN(latestAccountInfo.balance).toString(),
        nonce: ConversionUtils.number(latestAccountInfo.nonce),
        privateKey: stateManager.accounts[address].secretKey.toString('hex'),
        isUnlocked: stateManager.isUnlocked(address)
      }
    })).catch((err) => {
      console.log(err)
    })

    const currentBlockNumber = await this.blockFetcher.getCurrentBlockNumber()
    const blocks = await this.blockFetcher.getRecentBlocks(stateManager)
    const transactions = await this._getRecentTransactions(stateManager)

    const payload = {
      accounts: accounts,
      mnemonic: stateManager.mnemonic,
      hdPath: stateManager.wallet_hdpath,
      gasPrice: parseInt(`0x${stateManager.gasPriceVal}`, 16),
      gasLimit: stateManager.blockchain.blockGasLimit,
      totalAccounts: stateManager.total_accounts,
      coinbase: stateManager.coinbase,
      isMiningOnInterval: stateManager.is_mining_on_interval,
      isMining: stateManager.is_mining,
      blocktime: stateManager.blocktime,
      blockNumber: currentBlockNumber,
      networkId: stateManager.net_version,
      snapshots: stateManager.snapshots,
      blocks,
      transactions,
      host: 'localhost',
      port: this.port
    }

    return payload
  }

  async _getRecentTransactions (stateManager) {
    const currentBlockNumber = await this.blockFetcher.getCurrentBlockNumber()

    let transactions = []
    let blockIndex = currentBlockNumber

    while (transactions.length < 5 && blockIndex > 0) {
      const block = await this.blockFetcher.getBlock(blockIndex)
      if (block.transactions.length > 0) {
        transactions = transactions.concat(block.transactions.map(this._marshallTransaction))
      }
      blockIndex--
    }

    return transactions
  }

  _marshallTransaction = (transaction) => {
    let newTx = Object.assign({}, transaction)
    newTx.hash = transaction.hash()
    return newTx
  }

}
