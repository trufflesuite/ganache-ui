import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/TESTRPCRUNNING': (state, {type, payload}) => ({
    ...state,
    testRpcServerRunning: true,
    ...payload
  }),

  'APP/BLOCKCHAINSTATE': (state, {type, payload}) => ({
    ...state,
    testRpcServerRunning: true,
    ...payload
  }),

  'APP/TESTRPCLOG': (state, { type, payload }) => ({
    ...state,
    logs: state.logs.concat({ time: new Date().toLocaleTimeString(), message: payload.message })
  }),

  'APP/CLEARLOGS': (state, { type, payload }) => ({
    ...state,
    logs: []
  })
}

export default ReduceWith(mutators, DefaultState)
