import React from 'react'
import ReactDOM from 'react-dom'
import EventEmitter from 'events'

import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute } from 'react-router'

import { routerReducer } from 'react-router-redux'

import createStore from 'Kernel/createStore'
import syncStore from 'Kernel/syncStore'

import AppShell from 'Modules/AppShell/components/AppShell'
import ConfigScreen from 'Modules/Config/components/ConfigScreen'
import Accounts from 'Modules/Accounts/components/Accounts'

import Blocks from 'Modules/Blocks/components/Blocks'
import BlocksContainer from 'Modules/Blocks/components/BlocksContainer'
import RecentBlocks from 'Modules/Blocks/components/blocks/RecentBlocks'
import BlockCard from 'Modules/Blocks/components/blocks/BlockCard'

import TransactionsContainer from 'Modules/Transactions/components/TransactionsContainer'
import RecentTxs from 'Modules/Transactions/components/txs/RecentTxs'
import TransactionCard from 'Modules/Transactions/components/txs/TxCard'

import Console from 'Modules/Console/components/Console'
import AppUpdateScreen from 'Modules/AppUpdate/components/AppUpdateScreen'
import FirstRunScreen from 'Modules/FirstRun/components/FirstRunScreen'

class Application extends EventEmitter {
  constructor (name) {
    super()

    const _name = name
    Object.defineProperty(this, 'name', {
      enumerable: true,
      get: () => _name
    })

    const _reducers = {
      routing: routerReducer
    }
    Object.defineProperty(this, 'reducers', {
      enumerable: false,
      get: () => _reducers
    })
  }

  registerReducer (module) {
    let reducer = module.reducer
    let reducerName = module.name.replace(/DATASOURCE/, '').toLowerCase()
    this.reducers[reducerName] = reducer
    console.log(`Reducer registered: ${module.name}`)
  }

  init (callback) {
    this._init = () => new Promise((resolve, reject) => {
      callback(this, resolve, reject)
    })

    return this
  }

  ready (callback) {
    this._ready = () => new Promise((resolve, reject) => {
      callback(this, resolve, reject)
    })

    return this
  }

  render (id) {
    const root = document.getElementById(id)
    if (!root) {
      throw new Error(`DOM Node #${id} does not exist!`)
    }

    ReactDOM.render(
      <Provider store={this.store}>
        <Router history={this.history}>
          <Route path='/app_update' component={props => <AppUpdateScreen {...props} />} />
          <Route path="/" component={AppShell}>
            <Route path="/first_run" component={props => <FirstRunScreen {...props} />}/>
            <Route path='/accounts' component={Accounts} />
            <Route path="blocks" component={BlocksContainer}>
              <IndexRoute component={RecentBlocks} />
              <Route path=":block_number" component={BlockCard} />
            </Route>
            <Route path="transactions" component={TransactionsContainer} >
              <IndexRoute component={RecentTxs} />
              <Route path=":txhash" component={TransactionCard} />
            </Route>
            <Route path="/console" component={Console} />
            <Route path='/config' component={props => <ConfigScreen {...props} />} />
          </Route>
        </Router>
      </Provider>,
      root
    )
  }

  async start (id) {
    if (this._init) {
      await this._init()
    }

    // Create the store, see kernel/createStore.js
    const _store = createStore(combineReducers(this.reducers), {})
    Object.defineProperty(this, 'store', {
      enumerable: true,
      get: () => _store
    })

    // Sync history with store, see kernel/syncStore.js
    const _history = await syncStore(_store)
    Object.defineProperty(this, 'history', {
      enumerable: false,
      get: () => _history
    })

    if (this._ready) {
      await this._ready()
    }

    this.render(id)

    this.emit('applicationDidStart', this)
  }
}

export default Application
