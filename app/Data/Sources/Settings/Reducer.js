import DefaultState from './DefaultState'

import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/SETTINGS': (state, { type, payload }) => payload
}

export default ReduceWith(mutators, DefaultState)
