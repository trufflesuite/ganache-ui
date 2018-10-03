import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

import { setRPCProviderUrl } from '../../common/redux/web3/actions'

import {
  SET_SERVER_STARTED,
  SET_BLOCK_NUMBER,
  SET_SYSTEM_ERROR,
  SET_MODAL_ERROR,
  SET_KEY_DATA,
  getGasPrice,
  getGasLimit,
  getBlockSubscription,
  setServerStarted,
  setBlockNumber,
  setKeyData
} from '../../common/redux/core/actions'

import { getAccounts } from '../../common/redux/accounts/actions'

import { setSettings } from '../../common/redux/config/actions'

import { handleError } from './ErrorHandler'

export function initCore(store) {
  // Wait for the server to start...
  ipcRenderer.on(SET_SERVER_STARTED, (sender, globalSettings, workspaceSettings, openConfigScreenOnStart) => {
    // Get current settings into the store
    store.dispatch(setSettings(globalSettings, workspaceSettings))

    // Ensure web3 is set
    const url = `ws://${workspaceSettings.server.hostname}:${workspaceSettings.server.port}`
    ipcRenderer.send("web3-provider", url)
    store.dispatch(setRPCProviderUrl(url))
  
    store.dispatch(getAccounts())
    store.dispatch(getGasPrice())
    store.dispatch(getGasLimit())

    store.dispatch(getBlockSubscription())

    store.dispatch(setServerStarted())

    if (openConfigScreenOnStart) {
      store.dispatch(push("/config"))
    }
    else {
      store.dispatch(push("/accounts"))
    }
  })

  // Block polling happens in the chain process, and is passed through
  // the main process to the render process when there's a new block.
  ipcRenderer.on(SET_BLOCK_NUMBER, (event, number) => {
    store.dispatch(setBlockNumber(number))
  })

  ipcRenderer.on(SET_SYSTEM_ERROR, (event, error) => {
    handleError(store, error)
  })

  ipcRenderer.on(SET_MODAL_ERROR, (event, error) => {
    handleError(store, error)
  })

  // The server will send a second message that sets the mnemonic and hdpath
  ipcRenderer.on(SET_KEY_DATA, (event, data) => {
    store.dispatch(setKeyData(data.mnemonic, data.hdPath, data.privateKeys))
  })
}
