import * as RequestCache from "./actions";
import * as Core from "../core/actions";

const initialState = {};

// These requests are never invalidated.
const HARD_CACHED = {
  eth_accounts: true,
  eth_gasPrice: true,
  eth_getBlockByNumber: blockNumber => {
    return blockNumber != "latest" && blockNumber != "pending";
  },
  eth_getBlockTransactionCountByNumber: blockNumber => {
    return blockNumber != "latest" && blockNumber != "pending";
  },
  eth_getTransactionByHash: true,
};

const isHardCached = function(id) {
  let method = id.substring(0, id.indexOf("("));

  var hardCachedResult = HARD_CACHED[method];

  if (typeof hardCachedResult == "function") {
    var split = id.split(/\(|\)/);
    var params = split[1];

    if (params == "") {
      params = [];
    } else {
      params = params.split(",");
    }

    return hardCachedResult.apply(null, params);
  } else {
    return !!hardCachedResult;
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case RequestCache.CACHE_REQUEST:
      return Object.assign({}, state, {
        [action.id]: action.response,
      });

    case Core.SET_BLOCK_NUMBER:
      // Invalidate the cache on new block number
      let cache = Object.assign({}, state);

      Object.keys(cache).forEach(id => {
        if (!isHardCached(id)) {
          delete cache[id];
        }
      });

      return cache;
    default:
      return state;
  }
}
