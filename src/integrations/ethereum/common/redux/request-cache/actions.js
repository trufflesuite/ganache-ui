const prefix = "CACHE";

const createCacheId = function(payload) {
  let params = payload.params
    .map(param => {
      return param.toString();
    })
    .join(",");
  return `${payload.method}(${params})`;
};

export const CACHE_REQUEST = `${prefix}/CACHE_REQUEST`;
export const cacheRequest = function(payload, response) {
  let id = createCacheId(payload);
  return { type: CACHE_REQUEST, id, response };
};

export const checkCache = function(payload, getState) {
  // Never cache "eth_blockNumber"
  if (payload.method == "eth_blockNumber") {
    return null;
  }

  let cache = getState().requestCache;
  let id = createCacheId(payload);
  let hit = cache[id];

  if (!hit) {
    return null;
  }

  // Tailor the response to the new rpc id
  var response = Object.assign({}, hit);
  response.id = payload.id;
  return response;
};
