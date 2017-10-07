import React from 'react'
import ReactDOM from 'react-dom'

import { combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'

import SettingsReducer from 'Reducers/Settings'
import TestRPCReducer from 'Reducers/TestRPC'
import ConsoleReducer from 'Reducers/Console'
import CoreReducer from 'Reducers/Core'

import createStore from 'Kernel/createStore'
import syncStore from 'Kernel/syncStore'
import ready from 'Kernel/ready'

import AppShell from 'Components/AppShell/components/AppShell'
import ConfigScreen from 'Components/Config/components/ConfigScreen'
import Accounts from 'Components/Accounts/components/Accounts'

import BlocksContainer from 'Components/Blocks/components/BlocksContainer'
import BlockCard from 'Components/Blocks/components/blocks/BlockCard'

import TransactionsContainer from 'Components/Transactions/components/TransactionsContainer'
import RecentTxs from 'Components/Transactions/components/txs/RecentTxs'
import TransactionCard from 'Components/Transactions/components/txs/TxCard'

import Console from 'Components/Console/components/Console'
import AppUpdateScreen from 'Components/AppUpdate/components/AppUpdateScreen'
import FirstRunScreen from 'Components/FirstRun/components/FirstRunScreen'

import './app.global.css'

import '../resources/fonts/FiraSans-Regular.ttf'
import '../resources/fonts/FiraSans-Bold.ttf'
import '../resources/fonts/FiraSans-SemiBold.ttf'

const store = createStore(combineReducers({
  "settings": SettingsReducer,
  "testrpcsource": TestRPCReducer,
  "console": ConsoleReducer, 
  "core": CoreReducer 
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
        <Route path="/blocks" component={BlocksContainer} />
        <Route path="transactions" component={TransactionsContainer} >
          <IndexRoute component={RecentTxs} />
          <Route path=":txhash" component={TransactionCard} />
        </Route>
        <Route path="/console" component={Console} />
        <Route path='/config' component={props => <ConfigScreen {...props} />} />
      </Route>
    </Router>
  </Provider>,
  root
)
