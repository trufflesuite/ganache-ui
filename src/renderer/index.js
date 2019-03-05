import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import { Provider } from "react-redux";
import { Router, Route, hashHistory } from "react-router";

import RootReducer from "../common/redux/reducer";

import createStore from "./init/store/createStore";
import { initRenderer } from "./init/index";

import AppShell from "./screens/appshell/AppShell";
import ConfigScreen from "./screens/config/ConfigScreen";
import AccountsScreen from "./screens/accounts/AccountsScreen";
import BlocksScreen from "./screens/blocks/BlocksScreen";
import TransactionsScreen from "./screens/transactions/TransactionsScreen";
import LogsScreen from "./screens/logs/LogsScreen";
import EventsScreen from "./screens/events/EventsScreen";
import ContractDetails from "./screens/contracts/ContractDetails";
import EventDetailsScreen from "./screens/event-details/EventDetailsScreen";

import NotFoundScreen from "./screens/not-found/NotFoundScreen";
import TitleScreen from "./screens/title/TitleScreen";
import HomeScreen from "./screens/startup/HomeScreen";
import FirstRunScreen from "./screens/first-run/FirstRunScreen";
import ContractsScreen from "./screens/contracts/ContractsScreen";
import LoaderScreen from "./screens/loader/LoaderScreen";

import { ipcRenderer } from "electron";

const store = createStore(RootReducer);

initRenderer(store);

// Routes and stylesheets are declared here, rather than in the render
// function, so that hot module reloading doesn't cause issues with react-router.
const routes = (
  <Route>
    <Route path="/title" component={TitleScreen} />
    <Route path="/home" component={HomeScreen} />
    <Route path="/first_run" component={FirstRunScreen} />
    <Route path="/loader" component={LoaderScreen} />
    <Route path="/" component={AppShell}>
      <Route path="/accounts" component={AccountsScreen} />
      <Route path="/blocks(/:blockNumber)" component={BlocksScreen} />
      <Route
        path="/transactions(/:transactionHash)"
        component={TransactionsScreen}
      />
      <Route path="/logs" component={LogsScreen} />
      <Route path="/contracts" component={ContractsScreen} />
      <Route
        path="/contracts/:projectIndex/:contractAddress"
        component={ContractDetails}
      />
      <Route path="/events" component={EventsScreen} />
      <Route
        path="/event_details/:transactionHash/:logIndex"
        component={EventDetailsScreen}
      />
      <Route path="/notfound" component={NotFoundScreen} />
      <Route path="/config(/:activeTab)" component={ConfigScreen} />
    </Route>
  </Route>
);

ipcRenderer.on("navigate", (event, path) => {
  hashHistory.push(path);
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
  "./screens/not-found/NotFoundScreen.scss",
  "./screens/contracts/ContractsScreen.scss",
  "./screens/contracts/ContractDetailsScreen.scss",
  "./screens/events/EventList.scss",
  "./screens/events/EventsScreen.scss",
  "./screens/events/EventItem.scss",
  "./screens/event-details/EventDetailsScreen.scss",
  "./screens/event-details/EncodedEventDetails.scss",
  "./screens/event-details/DecodedEventDetails.scss",
  "./screens/startup/HomeScreen.scss",
  "./screens/loader/LoaderScreen.scss",
];

const render = () => {
  // This is "our hack"; basically, when HMR tells the Javascript
  // to rerender the whole app, we remove all stylesheets and re-add
  // them, so they refresh too. Pretty sweet.
  let links = document.getElementsByTagName("link");
  links = Array.prototype.slice.call(links);

  links.forEach(link => {
    link.parentElement.removeChild(link);
  });

  stylesheets.forEach(stylesheet => {
    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = stylesheet;
    document.getElementsByTagName("head")[0].appendChild(ss);
  });

  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Router history={hashHistory} routes={routes} />
      </Provider>
    </AppContainer>,
    document.getElementById("root"),
  );
};

//store.subscribe(render);
render();
if (module.hot) {
  module.hot.accept(render);
}
