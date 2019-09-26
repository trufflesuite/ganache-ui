import React from "react";
import { Route } from "react-router";

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

export default routes;