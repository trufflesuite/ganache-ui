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
import CoreReducer from "../../common/redux/core/reducers";
import EthereumCoreReducer from "../../integrations/ethereum/common/redux/core/reducers";
import Web3Reducer from "../../integrations/ethereum/common/redux/web3/reducers";
import AccountsReducer from "../../integrations/ethereum/common/redux/accounts/reducers";
import BlocksReducer from "../../integrations/ethereum/common/redux/blocks/reducers";
import TransactionsReducer from "../../integrations/ethereum/common/redux/transactions/reducers";
import LogsReducer from "./logs/reducers";
import RequestCacheReducer from "../../integrations/ethereum/common/redux/request-cache/reducers";
import UpdateReducer from "./auto-update/reducers";
import NetworkReducer from "./network/reducers";
import WorkspacesReducer from "./workspaces/reducers";
import EventsReducer from "../../integrations/ethereum/common/redux/events/reducers";
import { connectRouter } from 'connected-react-router';

export default (history) => {
  const appReducer = combineReducers({
    appshell: AppShellReducer,
    config: ConfigReducer,
    core: function(state, action) {
      const ethState = EthereumCoreReducer(state, action);
      const coreState = CoreReducer(ethState, action);
      return coreState;
    },
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
    router: connectRouter(history),
  });

  // This reducer is used to wipe all state on restart
  return (state, action) => {
    if (action.type === REQUEST_SERVER_RESTART) {
      state = undefined;
    }

    return appReducer(state, action);
  };
};
