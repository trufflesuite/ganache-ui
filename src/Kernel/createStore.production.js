import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { hashHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'

const router = routerMiddleware(hashHistory)

const enhancer = applyMiddleware(thunk, router)

export default function configureStore (reducers, initialState) {
  return createStore(reducers, initialState, enhancer); // eslint-disable-line
}
