import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default async function (app, done, error) {
  ipcRenderer.on('APP/TESTRPCSTARTED', (event, message) => {
    new Notification('TestRPC Started', {  // eslint-disable-line
      body: 'TestRPC Started',
      silent: true
    })

    app.store.dispatch({type: 'APP/TESTRPCRUNNING', payload: message})
    app.store.dispatch(push('/dashboard'))
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

  ipcRenderer.on('APP/BLOCKSEARCHRESULT', (event, message) => {
    app.store.dispatch({type: 'APP/BLOCKSEARCHRESULT', payload: message})
  })

  done()
}
