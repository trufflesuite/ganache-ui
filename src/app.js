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
import ConfigScreen from './Components/Config/ConfigScreen'
import AccountsScreen from './Components/Accounts/AccountsScreen'
import BlocksScreen from './Components/Blocks/BlocksScreen'
import TransactionsScreen from './Components/Transactions/TransactionsScreen'
import LogsScreen from './Components/Logs/LogsScreen'
import NotFoundScreen from './Components/NotFound/NotFoundScreen'
import TitleScreen from './Components/Title/TitleScreen'
import FirstRunScreen from './Components/FirstRun/FirstRunScreen'

document.addEventListener('dragover', event => {
  event.preventDefault()
  return false
})
document.addEventListener('drop', event => {
  event.preventDefault()
  return false
})

const store = createStore(RootReducer)

ready(store)

// Routes and stylesheets are declared here, rather than in the render
// function, so that hot module reloading doesn't cause issues with react-router.
const routes = <Route>
  <Route path='/title' component={TitleScreen} />
  <Route path="/" component={AppShell}>
    <Route path="/first_run" component={FirstRunScreen} />
    <Route path='/accounts' component={AccountsScreen} />
    <Route path="/blocks(/:blockNumber)" component={BlocksScreen} />
    <Route path="/transactions(/:transactionHash)" component={TransactionsScreen} />
    <Route path="/logs" component={LogsScreen} />
    <Route path="/notfound" component={NotFoundScreen} />
    <Route path='/config' component={ConfigScreen} />
  </Route>
</Route>

import "./Styles/colors.scss"
import "./Styles/normalize.scss"
import "./Styles/buttons.scss"
import "./Styles/forms.scss"
import "./Styles/cards.scss"
import "./app.global.scss"
import "./Elements/StatusIndicator.scss"
import "./Elements/Modal.scss"
import "./Elements/Spinner.css"
import "./Components/FirstRun/FirstRunScreen.scss"
import "./Components/AppShell/AppShell.scss"
import "./Components/AppShell/TopNavbar.scss"
import "./Components/AppShell/BugModal.scss"
import "./Components/Accounts/AccountsScreen.scss"
import "./Components/Accounts/AccountList.scss"
import "./Components/Accounts/KeyModal.scss"
import "./Components/Accounts/MnemonicAndHdPath.scss"
import "./Components/Accounts/MnemonicInfoModal.scss"
import "./Components/Blocks/BlocksScreen.scss"
import "./Components/Blocks/BlockList.scss"
import "./Components/Blocks/BlockCard.scss"
import "./Components/Blocks/MiniBlockCard.scss"
import "./Components/Transactions/TransactionsScreen.scss"
import "./Components/Transactions/RecentTransactions.scss"
import "./Components/Transactions/TxList.scss"
import "./Components/Transactions/TxCard.scss"
import "./Components/Transactions/TransactionTypeBadge.scss"
import "./Components/Transactions/MiniTxCard.scss"
import "./Components/Title/TitleScreen.scss"
import "./Components/Logs/LogsScreen.scss"
import "./Components/Logs/LogContainer.scss"
import "./Components/Config/ConfigScreen.scss"
import "./Components/NotFound/NotFoundScreen.scss"

const render = () => {
  ReactDOM.render(
    (
      <AppContainer>
        <Provider store={store}>
          <Router history={hashHistory} routes={routes} />
        </Provider>
      </AppContainer>
    ),
    document.getElementById("root")
  )
}

//store.subscribe(render);
render()
if (module.hot) {
  module.hot.accept(render);
}


