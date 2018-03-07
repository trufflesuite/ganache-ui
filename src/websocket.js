
const stringifyAction = JSON.stringify

const parseAction = (actionString) => {
  try {
    return JSON.parse(actionString)
  } catch (e) {
    console.log('error parsing action', e)
  }
}

const createActionSender = (sendMessage) => (type, payload) => sendMessage(stringifyAction({ type, payload }))

export const emitActions = (ws, actionEmitter) => {
  ws.on('message', (message) => {
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
export const createRendererActionClient = (ws) => {
  const actionClient = new EventEmitter()
  emitActions(ws, actionClient)
  actionClient.send = createActionSender(ws.send.bind(ws))
  return actionClient
}

/** Create an event emitter that mimics electrons ipcMain */
export const createMainActionClient = (wss) => {
  // Broadcast to all.
  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  const actionClient = new EventEmitter()
  wss.on('connection', (ws) => emitActions(ws, actionClient))
  actionClient.send = createActionSender(wss.broadcast)
  return actionClient
}
