import { ipcRenderer } from 'electron'

import * as Web3 from '../Actions/Web3'
import * as Core from '../Actions/Core'
import * as Accounts from '../Actions/Accounts'
import * as Logs from '../Actions/Logs'
import * as Config from '../Actions/Config'

import * as ErrorHandler from './ErrorHandler'

import { initAutoUpdates } from '../Init/Renderer/AutoUpdate'

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default function (store) {
  // Load the first screen while we wait for the application to load
  store.dispatch(Core.showTitleScreen())

  ipcRenderer.on(Config.SHOW_CONFIG_SCREEN, (event) => {
    store.dispatch(Config.showConfigScreen())
  })

  ipcRenderer.on(Config.SET_SETTING_ERROR, (event, key, value) => {
    store.dispatch(Config.setSettingError(key, value))
  })

  ipcRenderer.on(Config.CLEAR_SETTING_ERROR, (event, key) => {
    store.dispatch(Config.clearSettingError(key))
  })

  ipcRenderer.on(Config.CLEAR_ALL_SETTING_ERRORS, (event) => {
    store.dispatch(Config.clearAllSettingErrors())
  })

  ipcRenderer.on(Config.SET_SETTINGS, (event, settings) => {
    store.dispatch(Config.setSettings(settings))
  })

  // Wait for the server to start...
  ipcRenderer.on(Core.SET_SERVER_STARTED, (sender, currentSettings) => {
    // Get current settings into the store
    store.dispatch(Config.setSettings(currentSettings))

    // Ensure web3 is set
    store.dispatch(Web3.setRPCProviderUrl(`ws://${currentSettings.server.hostname}:${currentSettings.server.port}`))
  
    store.dispatch(Accounts.getAccounts())
    store.dispatch(Core.getGasPrice())
    store.dispatch(Core.getGasLimit())

    store.dispatch(Core.getBlockSubscription())

    store.dispatch(Core.setServerStarted())
  })

  // Block polling happens in the chain process, and is passed through
  // the main process to the render process when there's a new block.
  ipcRenderer.on(Core.SET_BLOCK_NUMBER, (event, number) => {
    store.dispatch(Core.setBlockNumber(number))
  })

  ipcRenderer.on(Core.SET_SYSTEM_ERROR, (event, error) => {
    ErrorHandler.handleError(store, error)
  })

  // The server will send a second message that sets the mnemonic and hdpath
  ipcRenderer.on(Core.SET_KEY_DATA, (event, data) => {
    store.dispatch(Core.setKeyData(data.mnemonic, data.hdPath, data.privateKeys))
  })

  ipcRenderer.on(Logs.ADD_LOG_LINES, (event, lines) => {
    store.dispatch(Logs.addLogLines(lines))
  })

  initAutoUpdates(ipcRenderer, store.dispatch)
}
