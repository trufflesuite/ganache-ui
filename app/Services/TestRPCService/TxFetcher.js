import { bufferToHex, toChecksumAddress } from 'ethereumjs-util'

export default class TransactionFetcher {
  constructor (stateManager) {
    this.stateManager = stateManager
  }

  async getRecentTransactions (
    currentBlockNumber,
    blockFetcher,
    numberToFetch = 10
  ) {
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

    let txs = await Promise.all(
      txPlaceholders.map(async (_, index) => {
        return new Promise((resolve, reject) => {
          this.stateManager.getTransactionReceipt(
            transactions[index].hash,
            (err, receipt) => {
              let tx = {}
              tx.hash = bufferToHex(transactions[index].hash)
              tx.nonce = bufferToHex(transactions[index].nonce)
              tx.gasUsed = bufferToHex(receipt.gasUsed)
              tx.block = receipt.block
              tx.data = bufferToHex(transactions[index].data)
              tx.from = toChecksumAddress(bufferToHex(transactions[index].from))
              tx.to =
                bufferToHex(receipt.tx.to) !== 0
                  ? toChecksumAddress(bufferToHex(receipt.tx.to))
                  : 0
              receipt.contractAddress
                ? (tx.contractAddress = toChecksumAddress(
                    receipt.contractAddress
                  ))
                : null
              err ? reject(err) : resolve(tx)
            }
          )
        })
      })
    )

    return txs
  }

  async getTxByHash (txHash) {
    return new Promise((resolve, reject) => {
      this.stateManager.getTransactionReceipt(txHash, (err, receipt) => {
        if (err) {
          reject(err)
        }

        if (!receipt) {
          reject('Transaction not found')
          return
        }

        let tx = Object.assign({}, receipt)
        tx.hash = txHash
        tx.data = bufferToHex(receipt.tx.data)
        tx.from = toChecksumAddress(bufferToHex(receipt.tx.from))

        tx.to =
          bufferToHex(receipt.tx.to) !== 0
            ? toChecksumAddress(bufferToHex(receipt.tx.to))
            : 0

        resolve(tx)
      })
    })
  }
}
