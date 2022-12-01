import Integrations from "../integrations";
import FilecoinChainService from "./common/services/FilecoinChainService";
import {
  SET_CURRENT_OPTIONS,
  SET_IPFS_URL,
  SET_KEY_DATA,
  SET_STORAGE_DEAL_STATUS_ENUM,
} from "./common/redux/core/actions";
import { SET_LOTUS_SCHEMA } from "./common/redux/lotus/actions";

class Filecoin extends Integrations {
  constructor(integrationManager) {
    super(integrationManager);

    this.chain = new FilecoinChainService(integrationManager.config);

    this._listen();
  }

  async _listen() {
    this._listenToIPC();

    this.chain.on("server-started-data", (data) => {
      this.send(SET_LOTUS_SCHEMA, {
        schema: data.schema,
      });

      this.send(SET_KEY_DATA, {
        seed: data.wallet.seed,
        privateKeys: data.privateKeys,
      });

      this.send(SET_IPFS_URL, {
        url: `http://${data.chain.ipfsHost}:${data.chain.ipfsPort}`,
      });

      this.send(SET_CURRENT_OPTIONS, {
        options: {
          chain: data.chain,
          database: data.database,
          logging: data.logging,
          miner: data.miner,
          wallet: data.wallet,
        },
      });

      this.send(SET_STORAGE_DEAL_STATUS_ENUM, {
        StorageDealStatus: data.StorageDealStatus,
      });
    });

    this.chain.on("message", this.emit.bind(this, "message"));
  }

  _ipcListeners = [];
  onIpc(event, callback) {
    this._ipcListeners.push({ event, callback });
    return this.ipc.on(event, callback);
  }
  offIpc() {
    this._ipcListeners.forEach(({ event, callback }) =>
      this.ipc.off(event, callback)
    );
    this._ipcListeners = [];
  }
  async _listenToIPC() {}

  async start() {
    return Promise.all([this.chain.start()]);
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
