import serializeBlock from './serializers/block'

export default class BlockFetcher {
  constructor (stateManager) {
    this.stateManager = stateManager
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
    })
  }

  async getRecentBlocks (stateManager) {
    const tailLength = 5
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
