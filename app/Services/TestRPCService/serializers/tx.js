export default function(transaction) {
  let newTx = Object.assign({}, transaction)
  newTx.hash = transaction.hash()
  return newTx
}
