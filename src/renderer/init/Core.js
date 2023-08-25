import { ipcRenderer } from "electron";
import { replace } from "connected-react-router";

import { setRPCProviderUrl } from "../../integrations/ethereum/common/redux/web3/actions";

import { createLotusInstance, setLotusInstance, setLotusSchema, SET_LOTUS_SCHEMA } from "../../integrations/filecoin/common/redux/lotus/actions";

import {
  SET_SERVER_STARTED,
  SET_SYSTEM_ERROR,
  SET_MODAL_ERROR,
  setServerStarted,
  SHOW_HOME_SCREEN,
  showHomeScreen,
  setProgress,
  SET_PROGRESS,
} from "../../common/redux/core/actions";

import {
  SET_BLOCK_NUMBER,
  SET_KEY_DATA,
  getGasPrice,
  getGasLimit,
  getBlockSubscription,
  setBlockNumber,
  setKeyData,
  setBlockNumberToLatest,
} from "../../integrations/ethereum/common/redux/core/actions";

import {
  SET_TIPSET_NUMBER,
  SET_KEY_DATA as FILECOIN_SET_KEY_DATA,
  getTipsetSubscription,
  setTipsetNumberToLatest,
  setKeyData as filecoinSetKeyData,
  SET_IPFS_URL,
  setIPFSUrl,
  SET_CURRENT_OPTIONS,
  setCurrentOptions,
  getMinerEnabledSubscription,
  SET_STORAGE_DEAL_STATUS_ENUM,
  setStorageDealStatusEnum,
  getDealSubscription,
} from "../../integrations/filecoin/common/redux/core/actions";

import { getAccounts } from "../../integrations/ethereum/common/redux/accounts/actions";

import {
  setSettings,
  setStartupMode,
  STARTUP_MODE,
} from "../../common/redux/config/actions";

import { handleError } from "./ErrorHandler";

export function initCore(store) {
  // Wait for the server to start...
  ipcRenderer.on(
    SET_SERVER_STARTED,
    async (sender, globalSettings, workspaceSettings, startupMode) => {
      // Get current settings into the store
      store.dispatch(setSettings(globalSettings, workspaceSettings));

      // Ensure web3 is set
      // 0.0.0.0 doesn't work the same as it does on other platforms, so we need to replace it
      // with localhost. Note: we don't want to update the _stored_ hostname, as 0.0.0.0 a valid concept.
      if (workspaceSettings.flavor == "ethereum") {
        const hostname = workspaceSettings.server.hostname.replace(
          "0.0.0.0",
          "localhost",
        );
        const url = workspaceSettings.useRemoteServer ? workspaceSettings.remoteServer.replace(/^http(s)?/i, "ws$1") : `ws://${hostname}:${workspaceSettings.server.port}`;

        ipcRenderer.send("web3-provider", url);
        store.dispatch(setRPCProviderUrl(url));

        store.dispatch(setBlockNumberToLatest());
        store.dispatch(getAccounts());
        store.dispatch(getGasPrice());
        store.dispatch(getGasLimit());

        store.dispatch(getBlockSubscription());

        store.dispatch(setServerStarted());
      } else if (workspaceSettings.flavor === "filecoin") {
        const hostname = workspaceSettings.server.hostname.replace(
          "0.0.0.0",
          "localhost",
        );
        const url = `ws://${hostname}:${workspaceSettings.server.port}/rpc/v0`;

        ipcRenderer.send("lotus-provider", url);

        if (startupMode === STARTUP_MODE.NORMAL) {
          const lotusInstance = await createLotusInstance(store.dispatch, store.getState, url);
          store.dispatch(setLotusInstance(lotusInstance));

          store.dispatch(setTipsetNumberToLatest());

          store.dispatch(getTipsetSubscription());

          store.dispatch(getMinerEnabledSubscription());

          store.dispatch(getDealSubscription());

          store.dispatch(setServerStarted());
        }
      }

      store.dispatch(setStartupMode(startupMode));
      switch (startupMode) {
        case STARTUP_MODE.SAVING_WORKSPACE:
        case STARTUP_MODE.EDIT_WORKSPACE:
        case STARTUP_MODE.NEW_WORKSPACE: {
          store.dispatch(replace("/config"));
          break;
        }
        case STARTUP_MODE.NORMAL:
        default: {
          if (workspaceSettings.flavor === "filecoin") {
            store.dispatch(replace("/filecoin/accounts"));
          } else {
            store.dispatch(replace("/accounts"));
          }
          break;
        }
      }
    },
  );

  /**
   * Common IPC Handlers
   */

  ipcRenderer.on(SET_PROGRESS, (event, message, minDuration) => {
    store.dispatch(setProgress(message, minDuration));
  });

  ipcRenderer.on(SET_SYSTEM_ERROR, (event, error) => {
    handleError(store, error);
  });

  ipcRenderer.on(SET_MODAL_ERROR, (event, error) => {
    handleError(store, error);
  });

  ipcRenderer.on(SHOW_HOME_SCREEN, () => {
    store.dispatch(showHomeScreen());
  });


  /**
   * Ethereum IPC Handlers
   */

  // Block polling happens in the chain process, and is passed through
  // the main process to the render process when there's a new block.
  ipcRenderer.on(SET_BLOCK_NUMBER, (event, number) => {
    store.dispatch(setBlockNumber(number));
  });

  // The server will send a second message that sets the mnemonic and hdpath
  ipcRenderer.on(SET_KEY_DATA, (event, data) => {
    store.dispatch(setKeyData(data.mnemonic, data.hdPath, data.privateKeys));
  });


  /**
   * Filecoin IPC Handlers
   */

  // Block polling happens in the chain process, and is passed through
  // the main process to the render process when there's a new block.
  ipcRenderer.on(SET_TIPSET_NUMBER, (event, number) => {
    store.dispatch(setBlockNumber(number));
  });

  // The server will send a second message that sets the mnemonic and hdpath
  ipcRenderer.on(FILECOIN_SET_KEY_DATA, (event, data) => {
    store.dispatch(filecoinSetKeyData(data.seed, data.privateKeys));
  });

  ipcRenderer.on(SET_IPFS_URL, (event, data) => {
    store.dispatch(setIPFSUrl(data.url));
  });

  ipcRenderer.on(SET_LOTUS_SCHEMA, (event, data) => {
    store.dispatch(setLotusSchema(data.schema));
  });

  ipcRenderer.on(SET_CURRENT_OPTIONS, (event, data) => {
    store.dispatch(setCurrentOptions(data.options));
  });

  ipcRenderer.on(SET_STORAGE_DEAL_STATUS_ENUM, (event, data) => {
    store.dispatch(setStorageDealStatusEnum(data.StorageDealStatus));
  });
}
