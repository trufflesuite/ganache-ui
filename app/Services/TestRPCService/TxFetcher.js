
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
        transactions = transactions.concat(block.transactions.map(this._marshallTransaction))
      }
      blockIndex--
    }

    return transactions
  }

  async getTxByHash (txHash) {
    console.log(`searching for: ${txHash}`)
    return new Promise((resolve, reject) => {
      this.stateManager.getTransactionReceipt(txHash, (err, receipt) => {
        err ? reject(err) : resolve(receipt)
      })
    })
  }

  _marshallTransaction = (transaction) => {
    let newTx = Object.assign({}, transaction)
    newTx.hash = transaction.hash()
    return newTx
  }
}
