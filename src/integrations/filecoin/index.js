import Integrations from "../integrations";
import FilecoinChainService from "./common/services/FilecoinChainService";
import { SET_KEY_DATA } from "./common/redux/core/actions";

class Filecoin extends Integrations {
  constructor(integrationManager) {
    super(integrationManager);

    this.chain = new FilecoinChainService(integrationManager.config);

    this._listen();
  }

  async _listen() {
    this._listenToIPC();

    this.chain.on("server-started", (data) => {
      // const workspace = this._integrationManager.workpace;
      this.send(SET_KEY_DATA, {
        privateKeys: data.privateKeys,
        // mnemonic: data.wallet.mnemonic, // TODO: should we support these?
        // hdPath: data.wallet.hdPath
      });

      // workspace.settings.handleNewMnemonic(data.mnemonic); // TODO: should we support?
    })

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
