import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { routerMiddleware } from 'connected-react-router';
import {
  processAction,
  processPage,
} from "../../../common/redux/middleware/analytics/index";

export default function configureStore(reducers, history, initialState) {
  const router = routerMiddleware();

  const enhancer = applyMiddleware(thunk, router, processAction);

  const store = createStore(reducers, initialState, enhancer); // eslint-disable-line

  history.listen(location =>
    processPage(location.pathname, store.getState()),
  );

  return store;
}
