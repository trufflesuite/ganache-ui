import ReduceWith from 'Data/Sources/ReduceWith'

export default ReduceWith({
  'APP/SETTINGS': (state, { type, payload }) => ({
    ...state,
    ...payload
  })
}, {})