import DefaultState from './DefaultState'
import * as TestRPCActions from './Actions'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/TESTRPCRUNNING': ({
    testRpcServerRunning: true
  }),

  'APP/TESTRPCLOG': (state, { type, payload }) => ({
    ...state,
    logs: state.logs.concat(payload.message)
  })
}

export default ReduceWith(mutators, DefaultState)
