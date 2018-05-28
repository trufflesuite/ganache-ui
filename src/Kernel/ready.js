import { push } from 'react-router-redux'

import actionClient from '../Kernel/actionClient'

import * as Web3 from '../Actions/Web3'
import * as Core from '../Actions/Core'
import * as Accounts from '../Actions/Accounts'
import * as Logs from '../Actions/Logs'
import * as Settings from '../Actions/Settings'

import { initAutoUpdates } from '../Init/Renderer/AutoUpdate'

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default function (store) {
  // Load the first screen while we wait for the application to load
  store.dispatch(Core.showTitleScreen())

  // Request all actions that already occured before this point (only applies to browser mode)
  actionClient.on('open', () => {
    actionClient.send(Core.REQUEST_ACTION_HISTORY)
  })

  // Wait for the server to start...
  actionClient.on(Core.SET_SERVER_STARTED, (event, currentSettings) => {
    // Get current settings into the store
    store.dispatch(Settings.setSettings(currentSettings))

    // Ensure web3 is set
    store.dispatch(Web3.setRPCProviderUrl(`ws://${currentSettings.server.hostname}:${currentSettings.server.port}`))

    store.dispatch(Accounts.getAccounts())
    store.dispatch(Core.getGasPrice())
    store.dispatch(Core.getGasLimit())
    store.dispatch(Core.getLatestBlock())

    store.dispatch(Core.getBlockSubscription())

    store.dispatch(Core.setServerStarted())
  })

  // Block polling happens in the chain process, and is passed through
  // the main process to the render process when there's a new block.
  actionClient.on(Core.SET_BLOCK_NUMBER, (event, number) => {
    store.dispatch(Core.setBlockNumber(number))
  })

  actionClient.on(Core.SET_SYSTEM_ERROR, (event, error) => {
    store.dispatch(Core.setSystemError(error))
  })

  // The server will send a second message that sets the mnemonic and hdpath
  actionClient.on(Core.SET_KEY_DATA, (event, data) => {
    store.dispatch(Core.setKeyData(data.mnemonic, data.hdPath, data.privateKeys))
  })

  actionClient.on(Logs.ADD_LOG_LINES, (event, lines) => {
    store.dispatch(Logs.addLogLines(lines))
  })

  actionClient.on(Settings.SET_SETTINGS, (event, settings) => {
    store.dispatch(Settings.setSettings(settings))
  })

  initAutoUpdates(actionClient, store.dispatch)
}
