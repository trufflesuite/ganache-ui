import serializeBlock from './serializers/block'

import autobind from 'class-autobind'
import SysLog from 'electron-log'

function bytesToSize (bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return (bytes / Math.pow(1024, i)).toFixed(4) + ' ' + sizes[i]
}

export default class BlockFetcher {
  constructor (stateManager, testRpcService) {
    this.stateManager = stateManager
    this.testRpcService = testRpcService
    autobind(this)
  }

  async getCurrentBlockNumber () {
    return new Promise((resolve, reject) => {
      this.stateManager.blockNumber((err, blockNumber) => {
        err ? reject(err) : resolve(blockNumber)
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  async getBlockByNumber (blockNumber) {
    return new Promise((resolve, reject) => {
      blockNumber = parseInt(blockNumber, 10)
      this.stateManager.getBlock(blockNumber, (err, block) => {
        err ? reject(err) : resolve(serializeBlock(block))
      })
    }).catch((err) => {
      console.log(err)
      return Promise.resolve({ 'error': `block not found: ${blockNumber}`})
    })
  }

  async getRecentBlocks (stateManager, numberToFetch = 10) {
    const tailLength = numberToFetch
    const currentBlockNumber = await this.getCurrentBlockNumber()
    const blockTailLength = currentBlockNumber < tailLength ? currentBlockNumber + 1 : tailLength
    const blockPlaceholders = new Array(blockTailLength).fill(null)

    let blocks = await Promise.all(blockPlaceholders.map(async (_, index) => {
      const requiredBlockNumber = currentBlockNumber - index
      return await this.getBlockByNumber(requiredBlockNumber)
    }))

    // console.log(`currentBlockNumber: ${currentBlockNumber} blocks: ${blocks}`)

    return blocks
  }

  async getBlockchainState (txFetcher) {
    const currentBlockNumber = await this.getCurrentBlockNumber()
    let blockChainState = await this.buildBlockChainState(this.testRpcService.txFetcher._marshallTransaction)

    blockChainState.transactions = await this.testRpcService.txFetcher.getRecentTransactions(currentBlockNumber, this)
    blockChainState.accounts = await this.testRpcService.accountFetcher.getAccountInfo()

    var mem = process.memoryUsage()
    SysLog.info(currentBlockNumber + ', ' + bytesToSize(mem.rss) + ', ' + bytesToSize(mem.heapTotal) + ', ' + bytesToSize(mem.heapUsed))

    return blockChainState
  }

  async buildBlockChainState (transactionMarshaller) {
    const stateManager = this.stateManager

    const currentBlockNumber = await this.getCurrentBlockNumber()
    let blocks = await this.getRecentBlocks(stateManager)

    const payload = {
      blocks,
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
      host: 'localhost',
      port: this.port
    }

    return payload
  }
}
