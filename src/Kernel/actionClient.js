if (process.env.TARGET === 'web') {
  const WebSocket = require('ws')
  const EventEmitter = require('events')
  const { createRendererActionClient } = require('../websocket')

  const ws = new WebSocket(`ws://${location.host}`)
  ws.onerror = (e) => console.error('WebSocket error', e)
  ws.onopen = () => console.log('WebSocket connection established')
  ws.onclose = () => console.log('WebSocket connection closed')

  module.exports = createRendererActionClient(ws)
} else if (process.env.TARGET === 'node') {
  module.exports = {}
} else { // electron
  module.exports = require('electron').ipcRenderer
}
