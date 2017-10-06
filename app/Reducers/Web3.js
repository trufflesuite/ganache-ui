import { 
  SET_RPC_PROVIDER,
  WEB3_REQUEST_SUCCEEDED
} from 'Actions/Web3'

export default function (state = {}, action) {
  switch (action.type) {
    case SET_RPC_PROVIDER:
      return Object.assign({}, state, {
        provider: action.provider
      })
    case WEB3_REQUEST_SUCCEEDED: 

      if (action.name == "getAccounts") {
        var eth = Object.assign({}, state.eth, {
          accounts: action.result
        })

        return Object.assign({}, state, eth)
      }      

    default:
      return state
  }
}