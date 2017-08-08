import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/REPLSTATE': (state, { type, payload }) => {
    return {
      ...state,
      consoleBuffer: state.consoleBuffer.concat(payload)
    }
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
