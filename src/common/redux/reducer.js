////
//
// Used to completely refresh app state.
//
// See here:
// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
//
////
import { combineReducers } from "redux";
import { REQUEST_SERVER_RESTART } from "./core/actions";

import AppShellReducer from "./appshell/reducers";
import ConfigReducer from "./config/reducers";
import CoreReducer from "./core/reducers";
import Web3Reducer from "./web3/reducers";
import AccountsReducer from "./accounts/reducers";
import BlocksReducer from "./blocks/reducers";
import TransactionsReducer from "./transactions/reducers";
import LogsReducer from "./logs/reducers";
import RequestCacheReducer from "./request-cache/reducers";
import UpdateReducer from "./auto-update/reducers";
import NetworkReducer from "./network/reducers";
import WorkspacesReducer from "./workspaces/reducers";
import EventsReducer from "./events/reducers";

const appReducer = combineReducers({
  appshell: AppShellReducer,
  config: ConfigReducer,
  core: CoreReducer,
  web3: Web3Reducer,
  accounts: AccountsReducer,
  blocks: BlocksReducer,
  transactions: TransactionsReducer,
  logs: LogsReducer,
  requestCache: RequestCacheReducer,
  autoUpdate: UpdateReducer,
  network: NetworkReducer,
  workspaces: WorkspacesReducer,
  events: EventsReducer,
});

// This reducer is used to wipe all state on restart
export default (state, action) => {
  if (action.type === REQUEST_SERVER_RESTART) {
    state = undefined;
  }

  return appReducer(state, action);
};
