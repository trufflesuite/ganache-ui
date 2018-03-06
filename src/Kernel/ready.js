// import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

import * as Web3 from '../Actions/Web3'
import * as Core from '../Actions/Core'
import * as Accounts from '../Actions/Accounts'
import * as Logs from '../Actions/Logs'
import * as Settings from '../Actions/Settings'

const initialSettings = {
  googleAnalyticsTracking: false,
  cpuAndMemoryProfiling: false,
  verboseLogging: false,
  firstRun: false,
  server: {
    hostname: "127.0.0.1",
    port: 7545,
    network_id: 5777,
    total_accounts: 10,
    unlocked_accounts: [],
    mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
    vmErrorsOnRPCResponse: true
  }
}

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default function (store) {
  // Load the first screen while we wait for the application to load
  store.dispatch(Core.showTitleScreen())

  // Wait for the server to start...
  //ipcRenderer.on(Core.SET_SERVER_STARTED, (sender, currentSettings) => {
    const currentSettings = initialSettings
    // Get current settings into the store
    store.dispatch(Settings.setSettings(currentSettings))

    // Ensure web3 is set
    store.dispatch(Web3.setRPCProviderUrl(`ws://${currentSettings.server.hostname}:${currentSettings.server.port}`))

    store.dispatch(Accounts.getAccounts())
    store.dispatch(Core.getGasPrice())
    store.dispatch(Core.getGasLimit())

    store.dispatch(Core.getBlockSubscription())

    store.dispatch(Core.setServerStarted())
  //})
/*
  // Block polling happens in the chain process, and is passed through
  // the main process to the render process when there's a new block.
  ipcRenderer.on(Core.SET_BLOCK_NUMBER, (event, number) => {
    store.dispatch(Core.setBlockNumber(number))
  })

  ipcRenderer.on(Core.SET_SYSTEM_ERROR, (event, error) => {
    store.dispatch(Core.setSystemError(error))
  })

  // The server will send a second message that sets the mnemonic and hdpath
  ipcRenderer.on(Core.SET_KEY_DATA, (event, data) => {
    store.dispatch(Core.setKeyData(data.mnemonic, data.hdPath, data.privateKeys))
  })

  ipcRenderer.on(Logs.ADD_LOG_LINES, (event, lines) => {
    store.dispatch(Logs.addLogLines(lines))
  })
  */
}
