import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/REPLSTATE': (state, {type, payload}) => {
    let messageType = 'response'

    if (payload.match(/.*Error:/)) {
      messageType = 'error'
    }

    let newState = {
      ...state,
      replBuffer: state.replBuffer.concat({ message: payload, type: messageType })
    }

    return newState
  },

  'APP/SENDREPLCOMMAND': (state, {type, payload}) => ({
    replBuffer: state.replBuffer.concat({
      message: payload,
      type: 'command',
      time: new Date().toLocaleTimeString()
    })
  }),

  'APP/REPLCOMMANDCOMPLETIONRESULT': (state, {type, payload}) => ({
    ...state,
    commandCompletions: payload.completions[0]
  }),

  'APP/REPLCLEAR': (state, {type, payload}) => (DefaultState)
}

export default ReduceWith(mutators, DefaultState)
