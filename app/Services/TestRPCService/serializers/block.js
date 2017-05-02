import transactionMarshaller from './tx.js'
import EtherUtil from 'ethereumjs-util'

export default function (block) {
  let newBlock = Object.assign({}, block)
  newBlock.hash = block.hash()
  newBlock.header.number = EtherUtil.bufferToInt(block.header.number)
  newBlock.transactions = newBlock.transactions.map(transactionMarshaller)
  return newBlock
}
