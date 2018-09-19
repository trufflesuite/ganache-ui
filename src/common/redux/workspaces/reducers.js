import {
  SET_WORKSPACES,
  SET_CURRENT_WORKSPACE
} from './actions'
import cloneDeep from 'lodash.clonedeep'

const initialState = {
  names: [],
  current: {}
}

export default function (state = initialState, action) {
  let nextState = cloneDeep(state)

  switch (action.type) {
    case SET_WORKSPACES:
      nextState.names = cloneDeep(action.workspaces)
      break
    case SET_CURRENT_WORKSPACE:
      nextState.current = cloneDeep(action.workspace)
      break
    default:
      break
  }

  return nextState
}