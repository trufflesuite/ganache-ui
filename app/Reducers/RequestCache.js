import * as RequestCache from 'Actions/RequestCache'
import * as Core from 'Actions/Core'

const initialState = {}

 // These requests are never invalidated.
const HARD_CACHED = {
  "eth_accounts": true,
  "eth_gasPrice": true,
  "eth_getBlockByNumber": true,
  "eth_getTransactionByHash": true
}

export default function (state = initialState, action) {
  switch (action.type) {
    case RequestCache.CACHE_REQUEST:
      return Object.assign({}, state, {
        [action.id]: action.response
      })
    
    case Core.SET_BLOCK_NUMBER:
      // Invalidate the cache on new block number
      let cache = Object.assign({}, state)
  
      Object.keys(cache).forEach((id) => {
        let method = id.substring(0, id.indexOf("("))
        if (!HARD_CACHED[method]) {
          delete cache[id]
        }
      })
    
      return cache
    default:
      return state
  }
}