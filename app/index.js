import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader';

import { applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'


import RootReducer from './Reducers/Root'

import createStore from './Kernel/createStore'
import syncStore from './Kernel/syncStore'
import ready from './Kernel/ready'

import AppShell from './Components/AppShell/AppShell'
// import ConfigScreen from './Components/Config/ConfigScreen'
import AccountsScreen from './Components/Accounts/AccountsScreen'
// import BlockContainer from './Components/Blocks/BlockContainer'
// import TransactionContainer from './Components/Transactions/TransactionContainer'
// import LogsScreen from './Components/Logs/LogsScreen'
// import NotFoundScreen from './Components/NotFound/NotFoundScreen'
import TitleScreen from './Components/Title/TitleScreen'
import FirstRunScreen from './Components/FirstRun/FirstRunScreen'

// import '../resources/fonts/FiraSans-Regular.ttf'
// import '../resources/fonts/FiraSans-Bold.ttf'
// import '../resources/fonts/FiraSans-SemiBold.ttf'

const store = createStore(RootReducer)

ready(store)

const root = document.getElementById("root")
if (!root) {
  throw new Error(`DOM Node #${id} does not exist!`)
}
const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Router history={hashHistory}>
          <Route path='/title' component={TitleScreen} />
          <Route path="/" component={AppShell}>
            <Route path="/first_run" component={FirstRunScreen} />
            <Route path='/accounts' component={AccountsScreen} />
            {/* <Route path="/blocks(/:blockNumber)" component={BlockContainer} />
            <Route path="/transactions(/:transactionHash)" component={TransactionContainer} />
            <Route path="/logs" component={LogsScreen} />
            <Route path="/notfound" component={NotFoundScreen} />
            <Route path='/config' component={props => <ConfigScreen {...props} />} /> */}
          </Route>
        </Router>
      </Provider>
    </AppContainer>,
    root
  )
}

window.addEventListener("load", () => {
  render()
  if (module.hot) {
    module.hot.accept(render);
  }
})

