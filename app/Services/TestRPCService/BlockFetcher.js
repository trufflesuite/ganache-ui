import EtherUtil from 'ethereumjs-util'

export default class BlockFetcher {
  constructor (stateManager, transactionMarshaller) {
    this.stateManager = stateManager
    this.transactionMarshaller = transactionMarshaller
  }

  async getCurrentBlockNumber () {
    return new Promise((resolve, reject) => {
      this.stateManager.blockNumber((err, blockNumber) => {
        err ? reject(err) : resolve(blockNumber)
      })
    })
  }

  async getBlock (blockNumber) {
    console.log(`Getting block number: ${blockNumber}`)
    return new Promise((resolve, reject) => {
      this.stateManager.getBlock(blockNumber, (err, block) => {
        err ? reject(err) : resolve(block)
      })
    })
  }

  async getRecentBlocks (stateManager) {
    const tailLength = 5
    const currentBlockNumber = await this.getCurrentBlockNumber()
    const blockTailLength = currentBlockNumber < tailLength ? currentBlockNumber : tailLength
    const blockPlaceholders = new Array(blockTailLength).fill(null)

    let blocks = await Promise.all(blockPlaceholders.map(async (_, index) => {
      const requiredBlockNumber = currentBlockNumber - index
      return await this.getBlock(requiredBlockNumber)
    }))

    // The block objects will lose prototype functions when serialized up to the Renderer
    return blocks.map((block) => {
      let newBlock = Object.assign({}, block)
      newBlock.hash = block.hash()
      newBlock.header.number = EtherUtil.bufferToInt(block.header.number)
      newBlock.transactions = newBlock.transactions.map(this.transactionMarshaller)
      return newBlock
    })
  }
}
