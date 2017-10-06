import { 
  SET_RPC_PROVIDER,
  WEB3_REQUEST_SUCCEEDED
} from 'Actions/Core'

const initialState = {
  accounts: [], 
  accountBalances: {},
  accountNonces: {}
}

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_RPC_PROVIDER:
      return Object.assign({}, state, {
        provider: action.provider
      })
    case WEB3_REQUEST_SUCCEEDED: 

      if (action.name == "getAccounts") {
        var accounts = action.accounts
        var accountBalances = Object.assign({}, state.accountBalances)
        var accountNonces = Object.assign({}, state.accountNonces)

        // Set default balance to zero if this is a new account
        accounts.forEach((account) => {
          if (!accountBalances[account]) accountBalances[account] = "0"
          if (!accountNonces[account]) accountNonces[account] = 0
        })

        return Object.assign({}, state, {
          accounts, 
          accountBalances,
          accountNonces
        })
      } 
      
      if (action.name == "getBalance") {
        var accountBalances = Object.assign({}, state.accountBalances, {
          [action.account]: action.balance
        })
        return Object.assign({}, state, {
          accountBalances
        })
      }

      if (action.name == "getTransactionCount") {
        var accountNonces = Object.assign({}, state.accountNonces, {
          [action.account]: action.nonce
        })
        return Object.assign({}, state, {
          accountNonces
        }) 
      }

    default:
      return state
  }
}