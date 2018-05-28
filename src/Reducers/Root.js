////
//
// Used to completely refresh app state.
// 
// See here:
// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
//
////
import { combineReducers } from 'redux'
import { REQUEST_SERVER_RESTART } from '../Actions/Core'

import AppShellReducer from './AppShell'
import SettingsReducer from './Settings'
import CoreReducer from './Core'
import Web3Reducer from './Web3'
import AccountsReducer from './Accounts'
import BlocksReducer from './Blocks'
import TransactionsReducer from './Transactions'
import LogsReducer from './Logs'
import RequestCacheReducer from './RequestCache'
import UpdateReducer from './AutoUpdate'

const appReducer = combineReducers({
  "appshell": AppShellReducer,
  "settings": SettingsReducer,
  "core": CoreReducer,
  "web3": Web3Reducer,
  "accounts": AccountsReducer,
  "blocks": BlocksReducer,
  "transactions": TransactionsReducer,
  "logs": LogsReducer,
  "requestCache": RequestCacheReducer,
  "autoUpdate": UpdateReducer
})

// This reducer is used to wipe all state on restart
export default (state, action) => {
  if (action.type === REQUEST_SERVER_RESTART) {
    state = undefined
  }

  return appReducer(state, action)
}
