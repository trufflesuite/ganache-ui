import { ipcRenderer } from 'electron'

import * as Web3 from '../../Actions/Web3'
import * as Core from '../../Actions/Core'
import * as Accounts from '../../Actions/Accounts'
import * as Config from '../../Actions/Config'

import * as ErrorHandler from '../../Kernel/ErrorHandler'

export function initCore(store) {
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
}
