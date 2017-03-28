
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

  _marshallTransaction = (transaction) => {
    let newTx = Object.assign({}, transaction)
    newTx.hash = transaction.hash()
    return newTx
  }
}
