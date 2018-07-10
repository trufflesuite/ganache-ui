import { ipcRenderer } from 'electron'

import { setRPCProviderUrl } from '../../Actions/Web3'

import {
  SET_SERVER_STARTED,
  SET_BLOCK_NUMBER,
  SET_SYSTEM_ERROR,
  SET_KEY_DATA,
  getGasPrice,
  getGasLimit,
  getBlockSubscription,
  setServerStarted,
  setBlockNumber,
  setKeyData
} from '../../Actions/Core'

import { getAccounts } from '../../Actions/Accounts'

import { setSettings } from '../../Actions/Config'

import { handleError } from './ErrorHandler'

export function initCore(store) {
  // Wait for the server to start...
  ipcRenderer.on(SET_SERVER_STARTED, (sender, currentSettings) => {
    // Get current settings into the store
    store.dispatch(setSettings(currentSettings))

    // Ensure web3 is set
    store.dispatch(setRPCProviderUrl(`ws://${currentSettings.server.hostname}:${currentSettings.server.port}`))
  
    store.dispatch(getAccounts())
    store.dispatch(getGasPrice())
    store.dispatch(getGasLimit())

    store.dispatch(getBlockSubscription())

    store.dispatch(setServerStarted())
  })

  // Block polling happens in the chain process, and is passed through
  // the main process to the render process when there's a new block.
  ipcRenderer.on(SET_BLOCK_NUMBER, (event, number) => {
    store.dispatch(setBlockNumber(number))
  })

  ipcRenderer.on(SET_SYSTEM_ERROR, (event, error) => {
    handleError(store, error)
  })

  // The server will send a second message that sets the mnemonic and hdpath
  ipcRenderer.on(SET_KEY_DATA, (event, data) => {
    store.dispatch(setKeyData(data.mnemonic, data.hdPath, data.privateKeys))
  })
}
