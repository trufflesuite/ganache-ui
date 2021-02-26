import { combineReducers } from "redux";

import AccountsReducer from "./accounts/reducers";
import CoreReducer from "./core/reducers";
import LotusReducer from "./lotus/reducers";
import RequestCacheReducer from "./request-cache/reducers";
import TipsetsReducer from "./tipsets/reducers";
import MessagesReducer from "./messages/reducers";
import DealsReducer from "./deals/reducers";

export default () => {
  const appReducer = combineReducers({
    accounts: AccountsReducer,
    core: CoreReducer,
    lotus: LotusReducer,
    requestCache: RequestCacheReducer,
    tipsets: TipsetsReducer,
    messages: MessagesReducer,
    deals: DealsReducer,
  });

  return appReducer;
};
