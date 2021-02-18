import * as RequestCache from "../../request-cache/actions";
import EventEmitter from "events";
import { BrowserProvider } from "@filecoin-shipyard/lotus-client-provider-browser";

class ReduxLotusProvider extends EventEmitter {
  constructor(url, dispatch, getState) {
    super();

    this.provider = new BrowserProvider(url);

    const parsedURL = new URL(url);
    const scheme = parsedURL.protocol.toLowerCase();
    this.isWebsocket = scheme === "ws:" || scheme === "wss:";

    this.dispatch = dispatch;
    this.getState = getState;
  }

  async initialize() {
    await this.provider.connect();
    if (this.isWebsocket) {
      this.provider.ws.on("data", this.emit.bind(this, "data"));
    } else {
      delete this.on;
      delete this.once;
    }
  }

  send(payload, callback) {
    const cached = RequestCache.checkCache(payload, this.getState);

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

      // if the workspace was closed in the middle of a response
      // just don't resolve
      if (!this.getState().web3.web3Instance) {
        return callback(new Error("No workspace"));
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

export default ReduxLotusProvider;
