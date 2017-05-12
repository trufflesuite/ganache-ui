export default class TransactionFetcher {
  constructor (stateManager) {
    this.stateManager = stateManager
  }

  async getRecentTransactions (currentBlockNumber, blockFetcher, numberToFetch = 10) {
    let transactions = []
    let blockIndex = currentBlockNumber

    while (transactions.length < numberToFetch && blockIndex > 0) {
      const block = await blockFetcher.getBlockByNumber(blockIndex)
      if (block.transactions.length > 0) {
        transactions = transactions.concat(block.transactions)
      }
      blockIndex--
    }

    const txPlaceholders = new Array(transactions.length).fill(null)

    let txs = await Promise.all(txPlaceholders.map(async (_, index) => {
      return new Promise((resolve, reject) => {
        this.stateManager.getTransactionReceipt(transactions[index].hash, (err, receipt) => {
          let tx = Object.assign({}, transactions[index])
          tx.hash = transactions[index].hash
          tx.gasUsed = receipt.gasUsed
          receipt.contractAddress ? tx.contractAddress = receipt.contractAddress : null
          err ? reject(err) : resolve(tx)
        })
      })
    }))

    return txs
  }

  async getTxByHash (txHash) {
    console.log(`searching for: ${txHash}`)
    return new Promise((resolve, reject) => {
      this.stateManager.getTransactionReceipt(txHash, (err, receipt) => {
        console.log(receipt)
        let tx = Object.assign({}, receipt)
        tx.hash = txHash
        err ? reject(err) : resolve(tx)
      })
    })
  }
}
