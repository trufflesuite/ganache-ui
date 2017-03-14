import Module from 'Core/Module'

import Reducer from './Reducer'

const datasource = new Module({
  name: 'Repl',
  reducer: Reducer
})

export default datasource
