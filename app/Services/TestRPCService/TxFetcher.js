import EtherUtils from 'ethereumjs-util'

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
          let tx = {}
          tx.hash = EtherUtils.bufferToHex(transactions[index].hash)
          tx.nonce = EtherUtils.bufferToHex(transactions[index].nonce)
          tx.gasUsed = EtherUtils.bufferToHex(receipt.gasUsed)
          tx.block = receipt.block
          tx.from = EtherUtils.toChecksumAddress(EtherUtils.bufferToHex(transactions[index].from))
          tx.to = EtherUtils.bufferToHex(transactions[index].to) !== 0 ? EtherUtils.toChecksumAddress(EtherUtils.bufferToHex(transactions[index].to)) : 0
          receipt.contractAddress ? tx.contractAddress = EtherUtils.toChecksumAddress(receipt.contractAddress) : null
          err ? reject(err) : resolve(tx)
        })
      })
    }))

    return txs
  }

  async getTxByHash (txHash) {
    return new Promise((resolve, reject) => {
      this.stateManager.getTransactionReceipt(txHash, (err, receipt) => {
        let tx = Object.assign({}, receipt)
        tx.hash = txHash
        tx.from = EtherUtils.toChecksumAddress(EtherUtils.bufferToHex(receipt.tx.from))
        tx.to = EtherUtils.bufferToHex(receipt.tx.to) !== 0 ? EtherUtils.toChecksumAddress(EtherUtils.bufferToHex(receipt.tx.to)) : 0
        err ? reject(err) : resolve(tx)
      })
    })
  }
}
