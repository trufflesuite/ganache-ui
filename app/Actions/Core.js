import Web3 from 'web3'

class RequestCache {
  constructor() {
    this.cache = {}
    this.blockNumber = -1;

    this.hardCached = {
      [this.createCacheId("eth_accounts", [])]: true
    }
  }

  setBlockNumber(blockNumber) {
    if (blockNumber != this.blockNumber) {
      this.blockNumber = blockNumber
      this.invalidateCache()
    }
  }

  invalidateCache() {
    Object.keys(this.cache).forEach((id) => {
      if (!this.hardCached[id]) {
        delete this.cache[id]
      }
    })
  }

  createCacheId(method, params) {
    params = params.map((param) => {
      return param.toString()
    }).join(",")
    return `${method}(${params})`
  }

  check(payload) {
    if (payload.method == "eth_blockNumber") {
      return false
    }

    let id = this.createCacheId(payload.method, payload.params)
    
    var hit = this.cache[id]

    if (!hit) {
      return null
    }
    
    // Tailor the response to the new rpc id
    var response = Object.assign({}, hit)
    response.id = payload.id
    return response
  }

  save(payload, response) {
    let id = this.createCacheId(payload.method, payload.params)
    this.cache[id] = response
  }
}

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

const prefix = "CORE"

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

function web3ActionCreator(name, args, next) {
  if (typeof args == "function") {
    next = args
    args = []
  }

  return function(dispatch, getState) {
    let provider = getState().core.provider
    let web3 = new Web3(provider)
    
    //dispatch(Web3RequestStarted(name))

    let fn = web3.eth[name]

    args.push((err, result) => {
      if (err) {
        //dispatch(Web3RequestFailed(name, err))
      } else {
        //dispatch(Web3RequestSucceeded(name, result))
        next(result, dispatch, getState)
      }
    })

    fn.apply(web3.eth, args)
  }
}

export const GET_ACCOUNTS = `${prefix}/GET_ACCOUNTS`
export const getAccounts = function() {
  return web3ActionCreator("getAccounts", (accounts, dispatch, getState) => {
    var currentAccounts = getState().core.accounts

    // Only save accounts if they've changed
    if (accounts.length > currentAccounts.length) {
      dispatch({ type: GET_ACCOUNTS, accounts })
    }

    accounts.forEach((account) => {
      dispatch(getAccountBalance(account))
      dispatch(getAccountNonce(account))
    })
  })
}

export const GET_ACCOUNT_BALANCE = `${prefix}/GET_ACCOUNT_BALANCE`
export const getAccountBalance = function(account) {
  return web3ActionCreator("getBalance", [account], (balance, dispatch, getState) => {
    var currentBalance = getState().core.accountBalances[account]

    // Remember, these are BigNumber objects
    if (balance.toString(10) != currentBalance.toString(10)) {
      dispatch({ type: GET_ACCOUNT_BALANCE, account, balance })
    }
  })
}

export const GET_ACCOUNT_NONCE = `${prefix}/GET_ACCOUNT_NONCE`
export const getAccountNonce = function(account) {
  return web3ActionCreator("getTransactionCount", [account], (nonce, dispatch, getState) => {
    var currentNonce = getState().core.accountNonces[account]

    if (nonce != currentNonce) {
      dispatch({ type: GET_ACCOUNT_NONCE, account, nonce })
    }
  })
}

export const GET_BLOCK_NUMBER = `${prefix}/GET_BLOCK_NUMBER`
export const getBlockNumber = function() {
  return web3ActionCreator("getBlockNumber", (number, dispatch, getState) => {
    var currentBlockNumber = getState().core.latestBlock

    if (number != currentBlockNumber) {
      dispatch({ type: GET_BLOCK_NUMBER, number })
    }
  })
}

export const GET_BLOCK = `${prefix}/GET_BLOCK`
export const getBlock = function(numberOrHash) {
  return web3ActionCreator("getBlock", [numberOrHash, true], (block, dispatch, getState) => {
    dispatch({type: GET_BLOCK, block })
  })
}

export const SET_LAST_REQUESTED_BLOCK_NUMBER = `${prefix}/SET_LAST_REQUESTED_BLOCK`
export function setLastRequestedBlock(number) {
  return function(dispatch, getState) {
    let lastRequestedBlock = getState().core.lastRequestedBlock

    if (number == lastRequestedBlock) {
      return
    }

    dispatch({ type: SET_LAST_REQUESTED_BLOCK_NUMBER, number })

    // We requested data about a new block; this means one of our accounts
    // likely made the transactions. Let's update the account data.
    dispatch(getAccounts())
  }
}

export const processBlocks = function() {
  return function(dispatch, getState) {
    var latestBlock = getState().core.latestBlock
    var lastRequestedBlock = getState().core.lastRequestedBlock

    if (latestBlock == lastRequestedBlock) {
      return
    }

    while (lastRequestedBlock < latestBlock ) {
      lastRequestedBlock += 1
      dispatch(getBlock(lastRequestedBlock))
    }

    dispatch(setLastRequestedBlock(lastRequestedBlock))
  }
}
