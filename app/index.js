import React from 'react'
import ReactDOM from 'react-dom'
import EventEmitter from 'events'

import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'

import SettingsReducer from 'Reducers/Settings'
import TestRPCReducer from 'Reducers/TestRPC'
import ConsoleReducer from 'Reducers/Console'

import createStore from 'Kernel/createStore'
import syncStore from 'Kernel/syncStore'
import ready from 'Kernel/ready'

import AppShell from 'Modules/AppShell/components/AppShell'
import ConfigScreen from 'Modules/Config/components/ConfigScreen'
import Accounts from 'Modules/Accounts/components/Accounts'

import Blocks from 'Modules/Blocks/components/Blocks'
import BlocksContainer from 'Modules/Blocks/components/BlocksContainer'
import RecentBlocks from 'Modules/Blocks/components/blocks/RecentBlocks'
import BlockCard from 'Modules/Blocks/components/blocks/BlockCard'

import TransactionsContainer from 'Modules/Transactions/components/TransactionsContainer'
import RecentTxs from 'Modules/Transactions/components/txs/RecentTxs'
import TransactionCard from 'Modules/Transactions/components/txs/TxCard'

import Console from 'Modules/Console/components/Console'
import AppUpdateScreen from 'Modules/AppUpdate/components/AppUpdateScreen'
import FirstRunScreen from 'Modules/FirstRun/components/FirstRunScreen'

import './app.global.css'

import '../resources/fonts/FiraSans-Regular.ttf'
import '../resources/fonts/FiraSans-Bold.ttf'
import '../resources/fonts/FiraSans-SemiBold.ttf'

const store = createStore(combineReducers({
  "settings": SettingsReducer,
  "testrpcsource": TestRPCReducer,
  "console": ConsoleReducer
}), {})

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
        <Route path="blocks" component={BlocksContainer}>
          <IndexRoute component={RecentBlocks} />
          <Route path=":block_number" component={BlockCard} />
        </Route>
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
