const EventEmitter = require('events')

const stringifyAction = JSON.stringify

const parseAction = (actionString) => {
  try {
    return JSON.parse(actionString)
  } catch (e) {
    console.log('error parsing action', e)
  }
}

const createActionSender = (sendMessage) => (type, payload) => sendMessage(stringifyAction({ type, payload }))

const emitActions = (ws, actionEmitter) => {
  (['error', 'open', 'close']).forEach((name) => ws.addEventListener(name, (...args) => actionEmitter.emit(name, ...args)))
  ws.addEventListener('message', ({ data: message }) => {
    const action = parseAction(message)
    if (typeof action === 'object' && action !== null) {
      const { type, payload } = action
      const event = {
        sender: {
          send: createActionSender(ws.send.bind(ws))
        }
      }
      actionEmitter.emit(type, event, payload)
    }
  })
}

/** Create an event emitter that mimics electrons ipcRenderer */
export const createActionClient = (ws) => {
  const actionClient = new EventEmitter()
  emitActions(ws, actionClient)
  actionClient.send = createActionSender(ws.send.bind(ws))
  return actionClient
}

/** Create an event emitter that mimics electrons ipcMain */
export const createServerActionClient = (wss) => {
  // Broadcast to all.
  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  const actionClient = new EventEmitter()
  wss.on('connection', (ws) => {
    actionClient.emit('connection')
    emitActions(ws, actionClient)
  })
  actionClient.send = createActionSender(wss.broadcast)
  return actionClient
}
