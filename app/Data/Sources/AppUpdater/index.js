import Module from 'Core/Module'

import Reducer from './Reducer'

const datasource = new Module({
  name: 'AppUpdater',
  reducer: Reducer
})

export default datasource
