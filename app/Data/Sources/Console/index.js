import Module from 'Core/Module'

import Reducer from './Reducer'

const datasource = new Module({
  name: 'Console',
  reducer: Reducer
})

export default datasource
