import Module from 'Core/Module'

import Reducer from './Reducer'

const datasource = new Module({
  name: 'SystemRequests',
  reducer: Reducer
})

export default datasource
