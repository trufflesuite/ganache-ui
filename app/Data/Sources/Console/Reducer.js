import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/REPLSTATE': (state, { type, payload }) => {
    let messageType = 'response'

    if (
      payload.hasOwnProperty('message') &&
      payload.message.match(/.*Error:/)
    ) {
      messageType = 'error'
    }

    if (!payload.hasOwnProperty('message')) {
      payload = {
        message: payload
      }
    }

    let newState = {
      ...state,
      consoleBuffer: state.consoleBuffer
        .concat({
          ...payload,
          type: messageType
        })
        .sort((a, b) => {
          return new Date(a.time) - new Date(b.time)
        })
    }

    return newState
  },

  'APP/SENDREPLCOMMAND': (state, { type, payload }) => ({
    consoleBuffer: state.consoleBuffer.concat({
      message: payload,
      type: 'command',
      time: new Date().toISOString()
    })
  }),

  'APP/REPLCOMMANDCOMPLETIONRESULT': (state, { type, payload }) => ({
    ...state,
    commandCompletions: payload.completions[0]
  }),

  'APP/REPLCLEAR': (state, { type, payload }) => DefaultState
}

export default ReduceWith(mutators, DefaultState)
