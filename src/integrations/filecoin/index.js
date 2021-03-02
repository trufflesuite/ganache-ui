import Integrations from "../integrations";
import FilecoinChainService from "./common/services/FilecoinChainService";
import { SET_IPFS_URL, SET_KEY_DATA } from "./common/redux/core/actions";
import { SET_LOTUS_SCHEMA } from "./common/redux/lotus/actions";

class Filecoin extends Integrations {
  constructor(integrationManager) {
    super(integrationManager);

    this.chain = new FilecoinChainService(integrationManager.config);

    this._listen();
  }

  async _listen() {
    this._listenToIPC();

    this.chain.on("server-started", (data) => {
      this.send(SET_LOTUS_SCHEMA, {
        schema: data.schema
      });

      this.send(SET_KEY_DATA, {
        seed: data.wallet.seed,
        privateKeys: data.privateKeys,
      });

      this.send(SET_IPFS_URL, {
        url: `http://${data.chain.ipfsHost}:${data.chain.ipfsPort}`
      });
    });

    this.chain.on("message", this.emit.bind(this, "message"));
  }

  _ipcListeners = []
  onIpc(event, callback){
    this._ipcListeners.push({event, callback});
    return this.ipc.on(event, callback);
  }
  offIpc() {
    this._ipcListeners.forEach(({event, callback}) => this.ipc.off(event, callback));
    this._ipcListeners = [];
  }
  async _listenToIPC() {
  }

  async start() {
    return Promise.all([
      this.chain.start()
    ]);
  }

  async startServer(workspaceSettings) {
    return this.chain.startServer(workspaceSettings);
  }

  async stop() {
    this.offIpc();
    await this.chain.stop();
  }
}

export default Filecoin;
