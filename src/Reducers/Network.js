import * as Network from '../Actions/Network'
import _ from 'lodash'

const initialState = {
  interfaces: {}
}

export default function (state = initialState, action) {
  let nextState = _.cloneDeep(state)

  switch (action.type) {
    case Network.SET_INTERFACES:
      // Ignore state; we're overwriting the settings.
      nextState.interfaces = _.cloneDeep(action.interfaces)
      break
    default:
      break
  }

  return nextState
}