import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader';

import { applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'


import RootReducer from '../common/redux/reducer'

import createStore from './init/store/createStore'
import syncStore from './init/store/syncStore'
import { initRenderer } from './init/index'

import AppShell from './screens/appshell/AppShell'
import ConfigScreen from './screens/config/ConfigScreen'
import AccountsScreen from './screens/accounts/AccountsScreen'
import BlocksScreen from './screens/blocks/BlocksScreen'
import TransactionsScreen from './screens/transactions/TransactionsScreen'
import LogsScreen from './screens/logs/LogsScreen'
import EventsScreen from './screens/events/EventsScreen'

import NotFoundScreen from './screens/not-found/NotFoundScreen'
import TitleScreen from './screens/title/TitleScreen'
import WorkspacesScreen from './screens/startup/WorkspacesScreen'
import FirstRunScreen from './screens/first-run/FirstRunScreen'

import {ipcRenderer} from 'electron'

const store = createStore(RootReducer)

initRenderer(store)

// Routes and stylesheets are declared here, rather than in the render
// function, so that hot module reloading doesn't cause issues with react-router.
const routes = <Route>
  <Route path='/title' component={TitleScreen} />
  <Route path='/workspaces' component={WorkspacesScreen} />
  <Route path="/first_run" component={FirstRunScreen} />
  <Route path="/" component={AppShell}>
    <Route path='/accounts' component={AccountsScreen} />
    <Route path="/blocks(/:blockNumber)" component={BlocksScreen} />
    <Route path="/transactions(/:transactionHash)" component={TransactionsScreen} />
    <Route path="/logs" component={LogsScreen} />
    <Route path='/events' component={EventsScreen} />
    <Route path="/notfound" component={NotFoundScreen} />
    <Route path='/config(/:activeTab)' component={ConfigScreen} /> 
  </Route>
</Route>

ipcRenderer.on('navigate', (event, path) => {
    hashHistory.push(path)
});

const stylesheets = [
  "./styles/colors.scss",
  "./styles/normalize.scss",
  "./styles/buttons.scss",
  "./styles/forms.scss",
  "./styles/cards.scss",
  "./app.global.scss",
  "./components/status-indicator/StatusIndicator.scss",
  "./components/modal/Modal.scss",
  "./components/progress-bar/ProgressBar.scss",
  "./components/spinner/Spinner.css",
  "./components/file-picker/FilePicker.scss",
  "./components/styled-select/StyledSelect.scss",
  "./screens/first-run/FirstRunScreen.scss",
  "./screens/appshell/AppShell.scss",
  "./screens/appshell/TopNavbar.scss",
  "./screens/appshell/BugModal.scss",
  "./screens/appshell/BugModal.scss",
  "./screens/accounts/AccountsScreen.scss",
  "./screens/accounts/AccountList.scss",
  "./screens/accounts/KeyModal.scss",
  "./screens/accounts/MnemonicAndHdPath.scss",
  "./screens/accounts/MnemonicInfoModal.scss",
  "./screens/blocks/BlocksScreen.scss",
  "./screens/blocks/BlockList.scss",
  "./screens/blocks/BlockCard.scss",
  "./screens/blocks/MiniBlockCard.scss",
  "./screens/transactions/TransactionsScreen.scss",
  "./screens/transactions/RecentTransactions.scss",
  "./screens/transactions/TxList.scss",
  "./screens/transactions/TxCard.scss",
  "./screens/transactions/TransactionTypeBadge.scss",
  "./screens/transactions/MiniTxCard.scss",
  "./screens/title/TitleScreen.scss",
  "./screens/auto-update/UpdateModal.scss",
  "./screens/auto-update/UpdateNotification.scss",
  "./screens/logs/LogsScreen.scss",
  "./screens/logs/LogContainer.scss",
  "./screens/config/ConfigScreen.scss",
  "./screens/not-found/NotFoundScreen.scss"
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


