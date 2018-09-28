import {
  GET_DECODED_EVENT
} from './actions'
import cloneDeep from 'lodash.clonedeep'

const initialState = {
  list: [],
  shown: {
    contract: {
      name: "",
      address: ""
    }
  }
}

export default function (state = initialState, action) {
  let nextState = cloneDeep(state)

  switch (action.type) {
    case GET_DECODED_EVENT:
      nextState.shown = {
        ...cloneDeep(action.event),
        contract: {
          name: action.contractName,
          address: action.contractAddress
        }
      }
      break
    default:
      break
  }

  return nextState
}