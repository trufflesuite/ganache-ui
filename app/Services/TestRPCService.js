import TestRPC from 'ethereumjs-testrpc'
import EtherUtil from 'ethereumjs-util'
import ConversionUtils from 'ethereumjs-testrpc/lib/utils/to'

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

    this._getLatestAccountInfo = this._getLatestAccountInfo.bind(this)
    this._buildBlockChainState = this._buildBlockChainState.bind(this)
    this._handleGetBlockchainState = this._handleGetBlockchainState.bind(this)

    console.log('Starting TestRPCService')

    ipcMain.on('APP/STARTRPC', this._handleStartTestRpc)
    ipcMain.on('APP/GETBLOCKCHAINSTATE', this._handleGetBlockchainState)
    ipcMain.on('APP/STARTMINING', this._handleStartMining)
    ipcMain.on('APP/STOPMINING', this._handleStopMining)
    ipcMain.on('APP/FORCEMINE', this._handleForceMine)
    ipcMain.on('APP/MAKESNAPSHOT', this._handleMakeSnapshot)
    ipcMain.on('APP/REVERTSNAPSHOT', this._handleRevertSnapshot)
    ipcMain.on('APP/ADDACCOUNT', this._handleAddAccount)
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
          reject(err)
        }

        resolve(res)
      })
    })
  }

  async _buildBlockChainState () {
    const stateManager = this.stateManager

    let accounts = await Promise.all(Object.keys(stateManager.accounts).map(async (address, index) => {
      let latestAccountInfo = await this._getLatestAccountInfo(address)

      return {
        index,
        address,
        balance: ConversionUtils.number(latestAccountInfo.balance),
        nonce: ConversionUtils.number(latestAccountInfo.nonce),
        privateKey: stateManager.accounts[address].secretKey.toString('hex'),
        isUnlocked: stateManager.isUnlocked(address)
      }
    }))

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
      blockNumber: stateManager.blockNumber(),
      networkId: stateManager.net_version,
      snapshots: stateManager.snapshots,
      blocks: this._getRecentBlocks(stateManager),
      transactions: this._getRecentTransactions(stateManager),
      host: 'localhost',
      port: this.port
    }

    return payload
  }

  _getRecentBlocks = (stateManager) => {
    let blockHeight = stateManager.blockchain.blocks.length

    // Slice out the last 5 blocks so that we don't inadvertently sort
    // the original blocks array and cause ALL SORTS OF BAD PROBLEMS
    let blocks = stateManager.blockchain.blocks.slice(blockHeight - 5, blockHeight).sort((a, b) => {
      return EtherUtil.bufferToInt(a.header.number) - EtherUtil.bufferToInt(b.header.number)
    }).reverse()

    // The block objects will lose prototype functions when serialized up to the Renderer
    return blocks.map((block) => {
      let newBlock = Object.assign({}, block)
      newBlock.hash = block.hash()
      newBlock.header.number = EtherUtil.bufferToInt(block.header.number)
      newBlock.transactions = newBlock.transactions.map(this._marshallTransaction)
      return newBlock
    })
  }

  _getRecentTransactions = (stateManager) => {
    const blocks = stateManager.blockchain.blocks
    const blockHeight = stateManager.blockchain.blocks.length - 1

    let transactions = []
    let blockIndex = blockHeight

    while (transactions.length < 5 && blockIndex > 0) {
      if (blocks[blockIndex].transactions.length > 0) {
        transactions = transactions.concat(blocks[blockIndex].transactions.map(this._marshallTransaction))
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
