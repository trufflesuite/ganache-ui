import marshallTransaction from './serializers/tx'

export default class TransactionFetcher {
  constructor (stateManager) {
    this.stateManager = stateManager
  }

  async getRecentTransactions (currentBlockNumber, blockFetcher) {
    let transactions = []
    let blockIndex = currentBlockNumber

    while (transactions.length < 5 && blockIndex > 0) {
      const block = await blockFetcher.getBlockByNumber(blockIndex)
      if (block.transactions.length > 0) {
        transactions = transactions.concat(block.transactions)
      }
      blockIndex--
    }

    return transactions
  }

  async getTxByHash (txHash) {
    console.log(`searching for: ${txHash}`)
    return new Promise((resolve, reject) => {
      this.stateManager.getTransactionReceipt(txHash, (err, receipt) => {
        let tx = Object.assign({}, receipt)
        tx.hash = txHash
        err ? reject(err) : resolve(tx)
      })
    })
  }
}
