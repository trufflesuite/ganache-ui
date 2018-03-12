/** Exports an event emitter that provides ipcRenderer functionality on web and electron-renderer targets */

let actionClient
if (process.env.WEBPACK_TARGET === 'web') {
  const ReconnectingWebSocket = require('reconnecting-websocket')
  const { createActionClient } = require('../wsActionClient')
  const backendHost = `ws://${window.location.host}/wss`
  const ws = new ReconnectingWebSocket(backendHost)
  ws.addEventListener('error', (e) => console.error(`WebSocket error connecting to backend ${backendHost}`, e))
  ws.addEventListener('open', () => console.log(`Opened WebSocket connection to backend ${backendHost}`))
  ws.addEventListener('close', () => console.log(`Closed WebSocket connection to backend ${backendHost}`))

  actionClient = createActionClient(ws)
} else if (process.env.WEBPACK_TARGET === 'electron-renderer') { // electron-renderer
  actionClient = require('electron').ipcRenderer
} else {
  actionClient = {}
}

module.exports = actionClient
