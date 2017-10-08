class RequestCache {
  constructor() {
    this.cache = {}
    this.blockNumber = -1;

    this.hardCached = {
      [this.createCacheId("eth_accounts", [])]: true, 
      [this.createCacheId("eth_gasPrice", [])]: true,
      [this.createCacheId("eth_getBlockByNumber", [0])]: true
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

export default RequestCache