import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

// Use the electron-settings app from the main process
const settings = require('electron').remote.require('electron-settings');

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default async function (app) {

  // Ensure the store has these initial settings
  
  app.store.dispatch({type: 'APP/SETTINGS', payload: settings.getAll()})

  app.store.dispatch(push('/app_update'))

  ipcRenderer.on('APP/TESTRPCSTARTED', (event, message) => {
    app.store.dispatch({ type: 'APP/TESTRPCRUNNING', payload: message })
  })

  ipcRenderer.on('APP/FATALERROR', (event, message) => {
    app.store.dispatch({ type: 'APP/FATALERROR', payload: message })
  })

  ipcRenderer.on('APP/BLOCKCHAINSTATE', (event, message) => {
    app.store.dispatch({ type: 'APP/BLOCKCHAINSTATE', payload: message })
  })

  ipcRenderer.on('APP/REPLSTATE', (event, message) => {
    app.store.dispatch({ type: 'APP/REPLSTATE', payload: message })
  })

  ipcRenderer.on('APP/REPLCLEAR', (event, message) => {
    app.store.dispatch({ type: 'APP/REPLCLEAR' })
  })

  ipcRenderer.on('APP/REPLCOMMANDCOMPLETIONRESULT', (event, message) => {
    app.store.dispatch({
      type: 'APP/REPLCOMMANDCOMPLETIONRESULT',
      payload: message
    })
  })

  ipcRenderer.on('APP/BLOCKSEARCHRESULT', (event, message) => {
    app.store.dispatch({ type: 'APP/BLOCKSEARCHRESULT', payload: message })
  })

  ipcRenderer.on('APP/TXSEARCHRESULT', (event, message) => {
    app.store.dispatch({ type: 'APP/TXSEARCHRESULT', payload: message })
  })

  ipcRenderer.on('APP/CHECKPORTRESULT', (event, message) => {
    app.store.dispatch({ type: 'APP/CHECKPORTRESULT', payload: message })
  })

  ipcRenderer.on('APP/SETTINGS', (event, settings) => {
    app.store.dispatch({ type: 'APP/SETTINGS', payload: settings })
  })
}
