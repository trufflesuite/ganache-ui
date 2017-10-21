import { web3Request } from './helpers/Web3ActionCreator'
import { push } from 'react-router-redux'

const prefix = 'SEARCH'

export const query = function(message) {
  return function(dispatch, getState) {
    let provider = getState().web3.provider
    // This will request the block by either its has or number
    web3Request("getBlock", [message, true], provider, (err, block) => {
      if (block) {
        dispatch(push(`/blocks/${block.number}`))
        return
      }

      web3Request("getTransaction", [message], provider, (err, transaction) => {
        if (transaction) {
          dispatch(push(`/transactions/${transaction.hash}`))
        } else {
          dispatch(push('/notfound'))
        }
      })
    })
  }
}
