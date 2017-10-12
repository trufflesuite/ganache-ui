////
//
// Used to completely refresh app state.
// 
// See here:
// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
//
////
import { combineReducers } from 'redux'
import { REQUEST_SERVER_RESTART } from 'Actions/Core'

import AppShellReducer from 'Reducers/AppShell'
import SettingsReducer from 'Reducers/Settings'
import CoreReducer from 'Reducers/Core'
import Web3Reducer from 'Reducers/Web3'
import AccountsReducer from 'Reducers/Accounts'
import BlocksReducer from 'Reducers/Blocks'
import TransactionsReducer from 'Reducers/Transactions'
import LogsReducer from 'Reducers/Logs'

const appReducer = combineReducers({
  "appshell": AppShellReducer,
  "settings": SettingsReducer,
  "core": CoreReducer,
  "web3": Web3Reducer,
  "accounts": AccountsReducer,
  "blocks": BlocksReducer,
  "transactions": TransactionsReducer,
  "logs": LogsReducer
})

// This reducer is used to wipe all state on restart
export default (state, action) => {
  if (action.type === REQUEST_SERVER_RESTART) {
    state = undefined
  }

  return appReducer(state, action)
}