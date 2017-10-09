import React from 'react'
import ReactDOM from 'react-dom'

import { combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'

import AppShellReducer from 'Reducers/AppShell'
import SettingsReducer from 'Reducers/Settings'
import CoreReducer from 'Reducers/Core'
import Web3Reducer from 'Reducers/Web3'
import AccountsReducer from 'Reducers/Accounts'
import BlocksReducer from 'Reducers/Blocks'
import TransactionsReducer from 'Reducers/Transactions'

import createStore from 'Kernel/createStore'
import syncStore from 'Kernel/syncStore'
import ready from 'Kernel/ready'

import AppShell from 'Components/AppShell/components/AppShell'
import ConfigScreen from 'Components/Config/components/ConfigScreen'
import Accounts from 'Components/Accounts/components/Accounts'
import BlockContainer from 'Components/Blocks/BlockContainer'
import TransactionContainer from 'Components/Transactions/TransactionContainer'

import Console from 'Components/Console/components/Console'
import AppUpdateScreen from 'Components/AppUpdate/components/AppUpdateScreen'
import FirstRunScreen from 'Components/FirstRun/components/FirstRunScreen'

import './app.global.css'

import '../resources/fonts/FiraSans-Regular.ttf'
import '../resources/fonts/FiraSans-Bold.ttf'
import '../resources/fonts/FiraSans-SemiBold.ttf'

const store = createStore(combineReducers({
  "appshell": AppShellReducer,
  "settings": SettingsReducer,
  "core": CoreReducer,
  "web3": Web3Reducer,
  "accounts": AccountsReducer,
  "blocks": BlocksReducer,
  "transactions": TransactionsReducer
}))

ready(store)

const root = document.getElementById("root")
if (!root) {
  throw new Error(`DOM Node #${id} does not exist!`)
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/app_update' component={AppUpdateScreen} />
      <Route path="/" component={AppShell}>
        <Route path="/first_run" component={FirstRunScreen}/>
        <Route path='/accounts' component={Accounts} />
        <Route path="/blocks(/:blockNumber)" component={BlockContainer} />
        <Route path="/transactions(/:transactionHash)" component={TransactionContainer} />
        <Route path="/console" component={Console} />
        <Route path='/config' component={props => <ConfigScreen {...props} />} />
      </Route>
    </Router>
  </Provider>,
  root
)
