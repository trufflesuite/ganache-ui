import ReduceWith from './ReduceWith'

export default ReduceWith({
  'APP/SETTINGS': (state, { type, payload }) => ({
    ...state,
    ...payload
  })
}, {})