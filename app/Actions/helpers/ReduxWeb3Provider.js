import Web3 from 'web3'
import * as RequestCache from 'Actions/RequestCache'

class ReduxWeb3Provider {
  constructor (url, dispatch, getState) {
    this.provider = new Web3.providers.HttpProvider(url) 
    this.dispatch = dispatch
    this.getState = getState
  }

  send () {
    throw new Error("Synchronous HTTP requests not supported!")
  }

  sendAsync (payload, callback) {
    var cached = RequestCache.checkCache(payload, this.getState)

    if (cached) {
      callback(null, cached)
      return
    }

    // Mark payload as an internal request
    // Slightly hacky; our chain won't log internal requests.
    // See chain.js.
    payload.internal = true

    this.dispatch(RPCRequestStarted(payload))

    this.provider.sendAsync(payload, (err, response) => {
      if (err || response.error) {
        this.dispatch(RPCRequestFailed(payload, response, err))
      } else {
        this.dispatch(RequestCache.cacheRequest(payload, response))
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
export function RPCRequestFailed(payload, response, error) {
  return { type: RPC_REQUEST_FAILED, payload, response, error}
}

export const RPC_REQUEST_SUCCEEDED = `${prefix}/RPC_REQUEST_SUCCEEDED`
export function RPCRequestSucceeded(payload, result) {
  return { type: RPC_REQUEST_SUCCEEDED, payload, result }
}

export default ReduxWeb3Provider