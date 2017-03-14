import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/REPLSTATE': (state, {type, payload}) => {
    let messageType = 'response'

    if (payload.match(/.*Error:/)) {
      messageType = 'error'
    }

    let newState = {
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
  })
}

export default ReduceWith(mutators, DefaultState)
