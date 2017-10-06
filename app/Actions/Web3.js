import Web3 from 'web3'

class ReduxWeb3Provider {
  constructor (url, dispatch) {
    this.provider = new Web3.providers.HttpProvider(url) 
    this.dispatch = dispatch
  }

  send () {
    throw new Error("Synchronous HTTP requests not supported!")
  }

  sendAsync (payload, callback) {
    console.log(arguments)

    this.dispatch(RPCRequestStarted(payload))

    this.provider.sendAsync(payload, (err, response) => {
      if (err) {
        this.dispatch(RPCRequestFailed(payload, err))
      } else {
        this.dispatch(RPCRequestSucceeded, payload, response.result)
      }

      callback(err, response)
    })
  }
}

const prefix = "WEB3"

export const SET_RPC_PROVIDER = `${prefix}/SET_RPC_PROVIDER`
export function setRPCProvider(provider) {
  return { type: SET_RPC_PROVIDER, provider }
}

export const SET_RPC_PROVIDER_URL = `${prefix}/SET_RPC_PROVIDER_URL`
export function setRPCProviderUrl(url) {
  return function(dispatch) {
    const provider = new ReduxWeb3Provider(url, dispatch)
    dispatch(setRPCProvider(provider))
  }
}

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

// 
export const WEB3_REQUEST_STARTED = `${prefix}/WEB3_REQUEST_STARTED`
export function Web3RequestStarted(name) {
  return { type: WEB3_REQUEST_STARTED, name }
}

export const WEB3_REQUEST_FAILED = `${prefix}/WEB3_REQUEST_FAILED`
export function Web3RequestFailed(name, error) {
  return { type: WEB3_REQUEST_FAILED, name, error}
}

export const WEB3_REQUEST_SUCCEEDED = `${prefix}/WEB3_REQUEST_SUCCEEDED`
export function Web3RequestSucceeded(name, result) {
  return { type: WEB3_REQUEST_SUCCEEDED, name, result }
}

function createWeb3ActionCreator(name) {
  // Little meta; this creates and action _creator_
  return function() {
    let args = Array.prototype.slice.call(arguments)  

    return function(dispatch, getState) {
      let provider = getState().web3.provider
      let web3 = new Web3(provider)
      
      dispatch(Web3RequestStarted(name))

      let fn = web3.eth[name]

      args.push((err, result) => {
        if (err) {
          dispatch(Web3RequestFailed(name, err))
        } else {
          dispatch(Web3RequestSucceeded(name, result))
        }
      })

      fn.apply(web3.eth, args)
    }
  }
}

export const eth = {
  getAccounts: createWeb3ActionCreator("getAccounts")
}
