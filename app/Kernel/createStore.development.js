import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { hashHistory } from 'react-router'
import { routerMiddleware, push } from 'react-router-redux'
import createLogger from 'redux-logger'

const actionCreators = {
  push
}

const logger = createLogger({
  level: 'info',
  collapsed: true
})

const router = routerMiddleware(hashHistory)

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
    actionCreators,
    maxAge: 5
  })
  : compose

/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(
  applyMiddleware(thunk, router, logger)
)

export default function configureStore (reducers, initialState) {
  const store = createStore(reducers, initialState, enhancer)

  // if (module.hot) {
  //   module.hot.accept('../reducers', () =>
  //     store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
  //   )
  // }

  return store
}
