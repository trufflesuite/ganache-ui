import Web3 from 'web3'
import RequestCache from './RequestCache'

class ReduxWeb3Provider {
  constructor (url, dispatch) {
    this.provider = new Web3.providers.HttpProvider(url) 
    this.dispatch = dispatch
    this.cache = new RequestCache()
  }

  send () {
    throw new Error("Synchronous HTTP requests not supported!")
  }

  sendAsync (payload, callback) {
    var cached = this.cache.check(payload)

    if (cached) {
      //this.dispatch(RPCRequestSucceeded(payload, cached)) 
      callback(null, cached)
      return
    }

    // Mark payload as an internal request
    // Slightly hacky; our chain won't log internal requests.
    // See chain.js.
    payload.internal = true

    this.dispatch(RPCRequestStarted(payload))

    this.provider.sendAsync(payload, (err, response) => {
      if (err) {
        this.dispatch(RPCRequestFailed(payload, err))
      } else {
        if (payload.method == "eth_blockNumber") {
          this.cache.setBlockNumber(response.result)
        } else {
          this.cache.save(payload, response)
        }
        this.dispatch(RPCRequestSucceeded(payload, response.result))
      }

      callback(err, response)
    })
  }
}

const prefix = "PROVIDER"

// Do we need these RPC request messages?
export const RPC_REQUEST_STARTED = `${prefix}/RPC_REQUEST_STARTED`
export function RPCRequestStarted(payload) {
  return { type: RPC_REQUEST_STARTED, payload }
}

export const RPC_REQUEST_FAILED = `${prefix}/RPC_REQUEST_FAILED`
export function RPCRequestFailed(payload, error) {
  return { type: RPC_REQUEST_FAILED, payload, error}
}

export const RPC_REQUEST_SUCCEEDED = `${prefix}/RPC_REQUEST_SUCCEEDED`
export function RPCRequestSucceeded(payload, result) {
  return { type: RPC_REQUEST_SUCCEEDED, payload, result }
}

export default ReduxWeb3Provider