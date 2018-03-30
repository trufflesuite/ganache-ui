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

const stylesheets = [
  "./Styles/colors.scss",
  "./Styles/normalize.scss",
  "./Styles/buttons.scss",
  "./Styles/forms.scss",
  "./Styles/cards.scss",
  "./app.global.scss",
  "./Elements/StatusIndicator.scss",
  "./Elements/Modal.scss",
  "./Elements/ProgressBar.scss",
  "./Elements/Spinner.css",
  "./Components/FirstRun/FirstRunScreen.scss",
  "./Components/AppShell/AppShell.scss",
  "./Components/AppShell/TopNavbar.scss",
  "./Components/AppShell/BugModal.scss",
  "./Components/AppShell/BugModal.scss",
  "./Components/Accounts/AccountsScreen.scss",
  "./Components/Accounts/AccountList.scss",
  "./Components/Accounts/KeyModal.scss",
  "./Components/Accounts/MnemonicAndHdPath.scss",
  "./Components/Accounts/MnemonicInfoModal.scss",
  "./Components/Blocks/BlocksScreen.scss",
  "./Components/Blocks/BlockList.scss",
  "./Components/Blocks/BlockCard.scss",
  "./Components/Blocks/MiniBlockCard.scss",
  "./Components/Transactions/TransactionsScreen.scss",
  "./Components/Transactions/RecentTransactions.scss",
  "./Components/Transactions/TxList.scss",
  "./Components/Transactions/TxCard.scss",
  "./Components/Transactions/TransactionTypeBadge.scss",
  "./Components/Transactions/MiniTxCard.scss",
  "./Components/Title/TitleScreen.scss",
  "./Components/AutoUpdate/UpdateModal.scss",
  "./Components/AutoUpdate/UpdateNotification.scss",
  "./Components/Logs/LogsScreen.scss",
  "./Components/Logs/LogContainer.scss",
  "./Components/Config/ConfigScreen.scss",
  "./Components/NotFound/NotFoundScreen.scss"
] 

const render = () => {

  // This is "our hack"; basically, when HMR tells the Javascript
  // to rerender the whole app, we remove all stylesheets and re-add
  // them, so they refresh too. Pretty sweet.
  let links = document.getElementsByTagName("link")
  links = Array.prototype.slice.call(links);

  links.forEach((link) => {
    link.parentElement.removeChild(link)
  })

  stylesheets.forEach((stylesheet) => {
    var ss = document.createElement("link")
    ss.type = "text/css"
    ss.rel = "stylesheet"
    ss.href = stylesheet
    document.getElementsByTagName("head")[0].appendChild(ss) 
  })

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


