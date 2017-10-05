import Module from 'Core/Module'
import ReduceWith from 'Data/Sources/ReduceWith'

const mutators = {
  'APP/SETTINGS': (state, { type, payload }) => ({
    ...state,
    ...payload
  })
}

export default new Module({
  name: 'Settings',
  reducer: ReduceWith(mutators, {})
})
