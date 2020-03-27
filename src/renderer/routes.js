import React, {Component} from "react";
import { Redirect, Route, Switch } from "react-router";

import AppShell from "./screens/appshell/AppShell";
import ConfigScreen from "./screens/config/ConfigScreen";
import AccountsScreen from "../integrations/ethereum/renderer/screens/accounts/AccountsScreen";

import CordaNodes from "../integrations/corda/renderer/screens/Nodes";
import CordaNode from "../integrations/corda/renderer/screens/NodeDetails";
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

class FlavorRoutes extends Component {
  render() {
    return <AppShell>
      <Switch>
        <Route path="/accounts" component={AccountsScreen} />
        <Route path="/blocks/:blockNumber?" component={BlocksScreen} />
        <Route
          path="/transactions/:transactionHash?"
          component={TransactionsScreen}
        />
        <Route exact path="/logs" component={LogsScreen} />
        <Route path="/logs/:context" component={LogsScreen} />
        <Route exact path="/contracts" component={ContractsScreen} />
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
        
        <Route path="/config/corda/:activeTab?" component={ConfigScreen} />
        <Route path="/config/:activeTab?" component={ConfigScreen} />

        <Route exact path="/corda">
          <Redirect to="/corda/nodes" />
        </Route>
        <Route exact path="/corda/nodes" component={CordaNodes} />
        <Route path="/corda/nodes/:node" component={CordaNode} />
        <Route exact path="/corda/cordapps" component={CordaCordapps} />
        <Route path="/corda/cordapps/:cordapp" component={CordaCordapp} />
        <Route exact path="/corda/transactions" component={CordaTransactions} />
        <Route path="/corda/transactions/:txhash" component={CordaTransaction} />
      </Switch>
    </AppShell>
  }
}

export default (<Switch>
  <Route exact path="/title" component={TitleScreen} />
  <Route exact path="/home" component={HomeScreen} />
  <Route exact path="/first_run" component={FirstRunScreen} />
  <Route exact path="/" component={LoaderScreen} />
  <Route exact path="/loader" component={LoaderScreen} />
  <Route component={FlavorRoutes} />
</Switch>);
