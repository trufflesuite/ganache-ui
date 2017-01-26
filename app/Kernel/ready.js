import { ipcRenderer } from 'electron'

// This will be called before the very first render, so you can do whatever
// you want here. The Redux Store is available at this point, so you can
// dispatch any action you want
export default async function (app, done, error) {
  ipcRenderer.on('APP/TESTRPCSTARTED', (event, message) => {
    new Notification('TestRPC Started', {  // eslint-disable-line
      body: 'TestRPC Started',
      silent: true
    })
  })

  done()
}
