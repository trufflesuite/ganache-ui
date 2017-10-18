import * as Web3 from '../Actions/Web3'

const initialState = {
  provider: null
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Web3.SET_RPC_PROVIDER:
      return Object.assign({}, state, {
        provider: action.provider
      })

    default:
      return state
  }
}