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

/* UPDATE HTML FILE */

const htmlStyleTag = document.createElement("style");
htmlStyleTag.innerHTML = `html {
  box-sizing: border-box;

  text-shadow: 1px 1px 1px rgba(0,0,0,.004);

  font-smooth: always;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: "Fira Sans", sans-serif;
  font-weight: 200;
  background-color: #312c2a;
}`;
document.head.appendChild(htmlStyleTag);


/* UPDATE HTML FILE */

const store = createStore(RootReducer);

initRenderer(store);

// TODO: see if this is still necessary
// document.addEventListener('dragover', event => {
//   event.preventDefault();
//   return false;
// });
// document.addEventListener('drop', event => {
//   event.preventDefault();
//   return false;
// });

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

import "./styles/colors.scss";
import "./styles/normalize.scss";
import "./styles/buttons.scss";
import "./styles/forms.scss";
import "./styles/cards.scss";
import "./app.global.scss";
import "./components/status-indicator/StatusIndicator.scss";
import "./components/modal/Modal.scss";
import "./components/progress-bar/ProgressBar.scss";
import "./components/spinner/Spinner.css";
import "./components/file-picker/FilePicker.scss";
import "./components/styled-select/StyledSelect.scss";
import "./screens/first-run/FirstRunScreen.scss";
import "./screens/appshell/AppShell.scss";
import "./screens/appshell/TopNavbar.scss";
import "./screens/appshell/BugModal.scss";
import "./screens/appshell/BugModal.scss";
import "./screens/accounts/AccountsScreen.scss";
import "./screens/accounts/AccountList.scss";
import "./screens/accounts/KeyModal.scss";
import "./screens/accounts/MnemonicAndHdPath.scss";
import "./screens/accounts/MnemonicInfoModal.scss";
import "./screens/blocks/BlocksScreen.scss";
import "./screens/blocks/BlockList.scss";
import "./screens/blocks/BlockCard.scss";
import "./screens/blocks/MiniBlockCard.scss";
import "./screens/transactions/TransactionsScreen.scss";
import "./screens/transactions/RecentTransactions.scss";
import "./screens/transactions/TxList.scss";
import "./screens/transactions/TxCard.scss";
import "./screens/transactions/TransactionTypeBadge.scss";
import "./screens/transactions/MiniTxCard.scss";
import "./screens/title/TitleScreen.scss";
import "./screens/auto-update/UpdateModal.scss";
import "./screens/auto-update/UpdateNotification.scss";
import "./screens/logs/LogsScreen.scss";
import "./screens/logs/LogContainer.scss";
import "./screens/config/ConfigScreen.scss";
import "./screens/not-found/NotFoundScreen.scss";
import "./screens/contracts/ContractsScreen.scss";
import "./screens/contracts/ContractDetailsScreen.scss";
import "./screens/events/EventList.scss";
import "./screens/events/EventsScreen.scss";
import "./screens/events/EventItem.scss";
import "./screens/event-details/EventDetailsScreen.scss";
import "./screens/event-details/EncodedEventDetails.scss";
import "./screens/event-details/DecodedEventDetails.scss";
import "./screens/startup/HomeScreen.scss";
import "./screens/loader/LoaderScreen.scss";

const render = () => {
  // // This is "our hack"; basically, when HMR tells the Javascript
  // // to rerender the whole app, we remove all stylesheets and re-add
  // // them, so they refresh too. Pretty sweet.
  // let links = document.getElementsByTagName("style");
  // links = Array.prototype.slice.call(links);

  // links.forEach(link => {
  //   link.parentElement.removeChild(link);
  // });
  //stylesheets.forEach(stylesheet => {
    // const ss = document.createElement("style");
    // ss.innerHTML = stylesheets.join("/n");
    // document.getElementsByTagName("head")[0].appendChild(ss);
  //});

  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Router history={hashHistory} routes={routes} />
      </Provider>
    </AppContainer>,
    document.getElementById("app"),
  );
};

store.subscribe(render);
try {
  render();
} catch (error) {
  console.log(error);
}
// if (module.hot) {
//   module.hot.accept(render);
// }
