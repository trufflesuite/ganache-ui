import * as RequestCache from "./actions";
import * as Core from "../core/actions";

const initialState = {};

// These requests are never invalidated.
const HARD_CACHED = {
  version: true,
  chainGetGenesis: true,
  actorAddress: true,
  stateListMiners: true,
  stateMinerPower: true,
  // stateMinerInfo: true, // TODO
  walletValidateAddress: true
};

const isHardCached = function(id) {
  const method = id.substring(0, id.indexOf("("));

  const hardCachedResult = HARD_CACHED[method];

  if (typeof hardCachedResult == "function") {
    const split = id.split(/\(|\)/);
    let params = split[1];

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

    case Core.SET_TIPSET_NUMBER: {
      // Invalidate the cache on new block number
      const cache = Object.assign({}, state);

      Object.keys(cache).forEach(id => {
        if (!isHardCached(id)) {
          delete cache[id];
        }
      });

      return cache;
    }
    default:
      return state;
  }
}
