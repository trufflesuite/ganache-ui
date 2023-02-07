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
      // we need to monkey patch here since BrowserProvider already monkey patched
      this.provider.ws.onmessage = event => {
        this.provider.receive(event);
        this.emit("data", event.data);
      };
    } else {
      delete this.on;
      delete this.once;
    }
  }

  async send(payload) {
    const cached = RequestCache.checkCache(payload, this.getState);

    if (cached) {
      return cached;
    }

    // Mark payload as an internal request
    // Slightly hacky; our chain won't log internal requests.
    // See chain.js.
    payload.internal = true;

    this.dispatch(RPCRequestStarted(payload));

    try {
      const response = await this.provider.send(payload);
      if (response.error) {
        this.dispatch(RPCRequestFailed(payload, response, null));
        return null;
      } else {
        this.dispatch(RequestCache.cacheRequest(payload, response));
        this.dispatch(RPCRequestSucceeded(payload, response.result));
      }

      // if the workspace was closed in the middle of a response
      // just don't resolve
      if (!this.getState().filecoin.lotus.lotusInstance) {
        this.dispatch(RPCRequestFailed(payload, null, "No Workspace"));
        return null;
      }

      return response;
    } catch (err) {
      this.dispatch(RPCRequestFailed(payload, null, err));
      return null;
    }
  }

  // we don't use the subscriptionCb passed by lotus-client-rpc (3rd arg)
  async sendSubscription (request, schemaMethod) {
    const emitter = new EventEmitter();

    const [unsubscribe, promise] = this.provider.sendSubscription(
      request,
      schemaMethod,
      (data) => emitter.emit("data", data)
    );

    await promise;

    emitter.on("unsubscribe", () => unsubscribe());

    return emitter;
  }

  async connect() {
    return this.provider.connect();
  }

  async importFile(body) {
    return this.provider.importFile(body)
  }

  async destroy() {
    await this.provider.destroy()
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
