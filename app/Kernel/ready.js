import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default async function (app, done, error) {
  app.store.dispatch(push('/app_update'))

  ipcRenderer.on('APP/TESTRPCSTARTED', (event, message) => {
    new Notification('Ganache Started', {  // eslint-disable-line
      body: 'Ganache Started',
      silent: true
    })

    app.store.dispatch({type: 'APP/TESTRPCRUNNING', payload: message})
    app.store.dispatch(push('/accounts'))
  })

  ipcRenderer.on('APP/TESTRPCLOG', (event, message) => {
    app.store.dispatch({type: 'APP/TESTRPCLOG', payload: message})
  })

  ipcRenderer.on('APP/BLOCKCHAINSTATE', (event, message) => {
    app.store.dispatch({type: 'APP/BLOCKCHAINSTATE', payload: message})
  })

  ipcRenderer.on('APP/REPLSTATE', (event, message) => {
    app.store.dispatch({type: 'APP/REPLSTATE', payload: message})
  })

  ipcRenderer.on('APP/REPLCLEAR', (event, message) => {
    app.store.dispatch({type: 'APP/REPLCLEAR'})
  })

  ipcRenderer.on('APP/REPLCOMMANDCOMPLETIONRESULT', (event, message) => {
    app.store.dispatch({type: 'APP/REPLCOMMANDCOMPLETIONRESULT', payload: message})
  })

  ipcRenderer.on('APP/BLOCKSEARCHRESULT', (event, message) => {
    app.store.dispatch({type: 'APP/BLOCKSEARCHRESULT', payload: message})
  })

  ipcRenderer.on('APP/TXSEARCHRESULT', (event, message) => {
    app.store.dispatch({type: 'APP/TXSEARCHRESULT', payload: message})
  })

  ipcRenderer.on('APP/CHECKPORTRESULT', (event, message) => {
    app.store.dispatch({type: 'APP/CHECKPORTRESULT', payload: message})
  })

  ipcRenderer.on('APP/UPDATECHECK', (event, message) => {
    app.store.dispatch({type: 'APP/UPDATECHECK', payload: message})
  })

  ipcRenderer.on('APP/UPDATEAVAILABLE', (event, info) => {
    app.store.dispatch({type: 'APP/UPDATEAVAILABLE', payload: info})
  })

  ipcRenderer.on('APP/UPDATENOTAVAILABLE', (event, info) => {
    app.store.dispatch({type: 'APP/UPDATENOTAVAILABLE', payload: info})
  })

  ipcRenderer.on('APP/UPDATEERROR', (event, err) => {
    app.store.dispatch({type: 'APP/UPDATEERROR', payload: err})
  })

  ipcRenderer.on('APP/UPDATEDOWNLOADPROGRESS', (event, progressObj) => {
    app.store.dispatch({type: 'APP/UPDATEDOWNLOADPROGRESS', payload: progressObj})
  })

  ipcRenderer.on('APP/UPDATEDOWNLOADED', (event, info) => {
    app.store.dispatch({type: 'APP/UPDATEDOWNLOADED', payload: info})
  })

  ipcRenderer.on('APP/SETTINGS', (event, settings) => {
    app.store.dispatch({type: 'APP/SETTINGS', payload: settings})
  })

  done()
}
