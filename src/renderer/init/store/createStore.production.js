import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { hashHistory } from "react-router";
import { routerMiddleware } from "react-router-redux";
import {
  processAction,
  processPage,
} from "../../../common/redux/middleware/analytics/index";

const router = routerMiddleware(hashHistory);

const enhancer = applyMiddleware(thunk, router, processAction);

export default function configureStore(reducers, initialState) {
  const store = createStore(reducers, initialState, enhancer); // eslint-disable-line

  hashHistory.listen(location =>
    processPage(location.pathname, store.getState()),
  );

  return store;
}
