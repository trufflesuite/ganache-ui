import React from "react";
import { Route } from "react-router";

import AppShell from "./screens/appshell/AppShell";
import ConfigScreen from "./screens/config/ConfigScreen";
import AccountsScreen from "../integrations/ethereum/renderer/screens/accounts/AccountsScreen";

import CordaNodes from "../integrations/corda/renderer/screens/Nodes";
import CordaNode from "../integrations/corda/renderer/screens/Node";
import CordaTransactions from "../integrations/corda/renderer/screens/Transactions";
import CordaTransaction from "../integrations/corda/renderer/screens/Transaction";
import CordaCordapps from "../integrations/corda/renderer/screens/Cordapps";
import CordaCordapp from "../integrations/corda/renderer/screens/Cordapp";

import BlocksScreen from "../integrations/ethereum/renderer/screens/blocks/BlocksScreen";
import TransactionsScreen from "../integrations/ethereum/renderer/screens/transactions/TransactionsScreen";
import LogsScreen from "./screens/logs/LogsScreen";
import EventsScreen from "../integrations/ethereum/renderer/screens/events/EventsScreen";
import ContractDetails from "../integrations/ethereum/renderer/screens/contracts/ContractDetails";
import EventDetailsScreen from "../integrations/ethereum/renderer/screens/event-details/EventDetailsScreen";
import NotFoundScreen from "./screens/not-found/NotFoundScreen";
import TitleScreen from "./screens/title/TitleScreen";
import HomeScreen from "./screens/startup/HomeScreen";
import FirstRunScreen from "./screens/first-run/FirstRunScreen";
import ContractsScreen from "../integrations/ethereum/renderer/screens/contracts/ContractsScreen";
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

        <Route path="/corda" component={CordaNodes} />
        <Route path="/corda/nodes/:node" component={CordaNode} />
        <Route path="/corda/notaries" component={CordaNodes} />
        <Route path="/corda/cordapps" component={CordaCordapps} />
        <Route path="/corda/cordapps/:cordapp" component={CordaCordapp} />
        <Route path="/corda/transactions" component={CordaTransactions} />
        <Route path="/corda/transactions/:node/:txhash" component={CordaTransaction} />
      </Route>
    </Route>
  );

export default routes;
