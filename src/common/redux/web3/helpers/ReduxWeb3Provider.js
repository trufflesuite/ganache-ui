import WsProvider from "web3-providers-ws";
import HttpProvider from "web3-providers-http";
import * as RequestCache from "../../request-cache/actions";
import EventEmitter from "events";

class ReduxWeb3Provider extends EventEmitter {
  constructor(url, dispatch, getState) {
    super();

    let parsedURL = new URL(url);
    let scheme = parsedURL.protocol.toLowerCase();

    if (scheme === "ws:" || scheme === "wss:") {
      this.provider = new WsProvider(url);
      this.provider.on("data", this.emit.bind(this, "data"));
    } else {
      this.provider = new HttpProvider(url);
      delete this.on;
      delete this.once;
    }
    this.dispatch = dispatch;
    this.getState = getState;
  }

  send(payload, callback) {
    var cached = RequestCache.checkCache(payload, this.getState);

    if (cached) {
      callback(null, cached);
      return;
    }

    // Mark payload as an internal request
    // Slightly hacky; our chain won't log internal requests.
    // See chain.js.
    payload.internal = true;

    this.dispatch(RPCRequestStarted(payload));

    this.provider.send(payload, (err, response) => {
      if (err || response.error) {
        this.dispatch(RPCRequestFailed(payload, response, err));
      } else {
        this.dispatch(RequestCache.cacheRequest(payload, response));
        this.dispatch(RPCRequestSucceeded(payload, response.result));
      }

      callback(err, response);
    });
  }
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

export default ReduxWeb3Provider;
