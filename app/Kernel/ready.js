import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux' 

import * as Web3 from 'Actions/Web3'
import * as Core from 'Actions/Core'
import * as Accounts from 'Actions/Accounts'
import * as Logs from 'Actions/Logs'

// Use the electron-settings app from the main process
const settings = require('electron').remote.require('electron-settings');

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default function (store) {
  // Ensure the store has these initial settings
  var currentSettings = settings.getAll()
  store.dispatch({type: 'APP/SETTINGS', payload: currentSettings})

  // Load the first screen
  store.dispatch(push('/app_update'))

  // Wait for the server to start...
  ipcRenderer.on(Core.SET_SERVER_STARTED, () => {
    store.dispatch(Core.setServerStarted())

    // Ensure web3 is set
    store.dispatch(Web3.setRPCProviderUrl(`http://${currentSettings.server.hostname}:${currentSettings.server.port}`))
  
    store.dispatch(Accounts.getAccounts())
    store.dispatch(Core.getGasPrice())
    store.dispatch(Core.getGasLimit())
  
    setInterval(() => {
      store.dispatch(Core.getBlockNumber())
      //store.dispatch(core.processBlocks())
    }, 500)
  })

  // The server will send a second message that sets the mnemonic and hdpath
  ipcRenderer.on(Core.SET_MNEMONIC_AND_HD_PATH, (event, data) => {
    store.dispatch(Core.setMnemonicAndHDPath(data.mnemonic, data.hdPath))
  })

  ipcRenderer.on(Logs.ADD_LOG_LINES, (event, lines) => {
    store.dispatch(Logs.addLogLines(lines))
  })
}
