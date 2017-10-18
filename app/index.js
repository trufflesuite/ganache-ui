import React from 'react'
import ReactDOM from 'react-dom'

import { applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'

import RootReducer from './Reducers/Root'

import createStore from './Kernel/createStore'
import syncStore from './Kernel/syncStore'
import ready from './Kernel/ready'

// import AppShell from './Components/AppShell/AppShell'
// import ConfigScreen from './Components/Config/ConfigScreen'
// import Accounts from './Components/Accounts/Accounts'
// import BlockContainer from './Components/Blocks/BlockContainer'
// import TransactionContainer from './Components/Transactions/TransactionContainer'
// import LogsScreen from './Components/Logs/LogsScreen'
// import NotFoundScreen from './Components/NotFound/NotFoundScreen'
import TitleScreen from './Components/Title/TitleScreen'
//import FirstRunScreen from './Components/FirstRun/FirstRunScreen'

// import '../resources/fonts/FiraSans-Regular.ttf'
// import '../resources/fonts/FiraSans-Bold.ttf'
// import '../resources/fonts/FiraSans-SemiBold.ttf'

const store = createStore(RootReducer)

ready(store)

const root = document.getElementById("root")
if (!root) {
  throw new Error(`DOM Node #${id} does not exist!`)
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/title' component={TitleScreen} />
      {/* <Route path="/" component={AppShell}>
        <Route path="/first_run" component={FirstRunScreen}/>
        <Route path='/accounts' component={Accounts} />
        <Route path="/blocks(/:blockNumber)" component={BlockContainer} />
        <Route path="/transactions(/:transactionHash)" component={TransactionContainer} />
        <Route path="/logs" component={LogsScreen} />
        <Route path="/notfound" component={NotFoundScreen} />
        <Route path='/config' component={props => <ConfigScreen {...props} />} />
      </Route> */}
    </Router>
  </Provider>,
  root
)
