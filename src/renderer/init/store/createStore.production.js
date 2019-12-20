import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { routerMiddleware } from 'connected-react-router';
import {
  processAction,
  processPage,
} from "../../../common/redux/middleware/analytics/index";

export default function configureStore(reducers, history, initialState) {
  const router = routerMiddleware(history);

  const enhancer = compose(applyMiddleware(thunk, router, processAction));

  const store = createStore(reducers, initialState, enhancer);

  // add google analytics to production
  history.listen(location => processPage(location.pathname, store.getState())
  );

  return store;
}
