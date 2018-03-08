if (process.env.TARGET === 'web') {
  const { createActionClient } = require('../websocket')

  const ws = new WebSocket(`ws://${location.host}`)
  ws.addEventListener('error', (e) => console.error('WebSocket error', e))
  ws.addEventListener('open', () => console.log('WebSocket connection established'))
  ws.addEventListener('close', () => console.log('WebSocket connection closed'))

  module.exports = createActionClient(ws)
} else if (process.env.TARGET === 'node') {
  module.exports = {}
} else { // electron
  const actionClient = require('electron').ipcRenderer
  actionClient.emit('open')
  module.exports = actionClient
}
