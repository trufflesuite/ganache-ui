if (process.env.WEBPACK_TARGET === 'web') {
  const { createActionClient } = require('../websocket')
  const backendHost = `ws://${location.host}/wss`
  const ws = new WebSocket(backendHost)
  ws.addEventListener('error', (e) => console.error(`WebSocket error connecting to backend ${backendHost}`, e))
  ws.addEventListener('open', () => console.log(`Opened WebSocket connection to backend ${backendHost}`))
  ws.addEventListener('close', () => console.log(`Closed WebSocket connection to backend ${backendHost}`))

  module.exports = createActionClient(ws)
} else if (process.env.WEBPACK_TARGET === 'electron-renderer') { // electron-renderer
  const actionClient = require('electron').ipcRenderer
  actionClient.emit('open')
  module.exports = actionClient
} else {
  module.exports = {}
}
