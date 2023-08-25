import { WebSocketProvider } from "web3-providers-ws";
import { HttpProvider } from "web3-providers-http";
import * as RequestCache from "../../request-cache/actions";

function makeReduxWeb3Provider(url, dispatch, getState) {
  let parsedURL = new URL(url);
  let scheme = parsedURL.protocol.toLowerCase();
  let provider

  if (scheme === "ws:" || scheme === "wss:") {
    provider = new WebSocketProvider(url, {}, {
      delay: 500,
      autoReconnect: true,
      maxAttempts: 10,
    });
  } else {
    provider = new HttpProvider(url);
  }
  provider.dispatch = dispatch;
  provider.getState = getState;

  const originalRequest = provider.request.bind(provider);
  provider.request = async (payload) => {
    var cached = RequestCache.checkCache(payload, provider.getState);

    if (cached) {
      return cached;
    }

    // Mark payload as an internal request
    // Slightly hacky; our chain won't log internal requests.
    // See chain.js.
    payload.internal = true;

    provider.dispatch(RPCRequestStarted(payload));

    let response;
    let err;
    try {
      response = await originalRequest(payload);
    } catch (e) {
      err = e;
    }

    if (err || response.error) {
      provider.dispatch(RPCRequestFailed(payload, response, err));
    } else {
      provider.dispatch(RequestCache.cacheRequest(payload, response));
      provider.dispatch(RPCRequestSucceeded(payload, response.result));
    }

    // if the workspace was closed in the middle of a response
    // just don't resolve
    if (!provider.getState().web3.web3Instance) {
      return null;
    }

    if (err) throw err;

    return response;
  }

  return provider;
}

const prefix = "PROVIDER";

// Do we need these RPC request messages?
export const RPC_REQUEST_STARTED = `${prefix}/RPC_REQUEST_STARTED`;
export function RPCRequestStarted(payload) {
  return { type: RPC_REQUEST_STARTED, payload };
}

export const RPC_REQUEST_FAILED = `${prefix}/RPC_REQUEST_FAILED`;
export function RPCRequestFailed(payload, response, error) {
  return { type: RPC_REQUEST_FAILED, payload, response, error };
}

export const RPC_REQUEST_SUCCEEDED = `${prefix}/RPC_REQUEST_SUCCEEDED`;
export function RPCRequestSucceeded(payload, result) {
  return { type: RPC_REQUEST_SUCCEEDED, payload, result };
}

export default makeReduxWeb3Provider;
