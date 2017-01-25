import DefaultState from './DefaultState'
import * as TestRPCActions from './Actions'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  [TestRPCActions.appStartRpcServiceType]: {
    recentBlocks: action => action.payload
  }
}

export default ReduceWith(mutators, DefaultState)
