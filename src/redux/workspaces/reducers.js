import {
  SET_WORKSPACES
} from './actions'
import cloneDeep from 'lodash.clonedeep'

const initialState = {
  names: []
}

export default function (state = initialState, action) {
  let nextState = cloneDeep(state)

  switch (action.type) {
    case SET_WORKSPACES:
      nextState.names = cloneDeep(action.workspaces)
      break
    default:
      break
  }

  return nextState
}