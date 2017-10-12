class RequestCache {
  constructor() {
    this.cache = {}
    this.blockNumber = -1;

    // These requests are never invalidated.
    this.hardCached = {
      "eth_accounts": true,
      "eth_gasPrice": true,
      "eth_getBlockByNumber": true,
      "eth_getTransactionByHash": true
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
      let method = id.substring(0, id.indexOf("("))
      if (!this.hardCached[method]) {
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

export default RequestCache