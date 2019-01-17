import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { hashHistory } from "react-router";
import { routerMiddleware, push } from "react-router-redux";
import createLogger from "redux-logger";

import {
  RPC_REQUEST_STARTED,
  RPC_REQUEST_SUCCEEDED,
} from "../../../common/redux/web3/helpers/ReduxWeb3Provider";

import { ADD_LOG_LINES } from "../../../common/redux/logs/actions";

import { SET_SCROLL_POSITION } from "../../../common/redux/appshell/actions";

import { CACHE_REQUEST } from "../../../common/redux/request-cache/actions";

const actionCreators = {
  push,
};

const actionsToIgnoreInConsoleLogger = [
  "APP/BLOCKCHAINSTATE",
  "app/markRequestPending",
  "app/markRequestSuccess",
  "APP/REPLSTATE",
  "APP/REPLSTATE",
  RPC_REQUEST_STARTED,
  RPC_REQUEST_SUCCEEDED,
  ADD_LOG_LINES,
  SET_SCROLL_POSITION,
  CACHE_REQUEST,
];

const logger = createLogger({
  level: "info",
  collapsed: true,
  predicate: (getState, action) => {
    return actionsToIgnoreInConsoleLogger.indexOf(action.type) === -1;
  },
});

const router = routerMiddleware(hashHistory);

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
      actionCreators,
      maxAge: 5,
    })
  : compose;

/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(applyMiddleware(thunk, router, logger));

export default function configureStore(reducers, initialState) {
  const store = createStore(reducers, initialState, enhancer);

  // if (module.hot) {
  //   module.hot.accept('../reducers', () =>
  //     store.consoleaceReducer(require('../reducers')) // eslint-disable-line global-require
  //   )
  // }

  return store;
}
