import React from 'react'
import ReactDOM from 'react-dom'
import EventEmitter from 'events'

import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router } from 'react-router'

import { routerReducer } from 'react-router-redux'

import createStore from 'Kernel/createStore'
import syncStore from 'Kernel/syncStore'

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

    const _appServices = {
    }
    Object.defineProperty(this, 'appServices', {
      enumerable: false,
      get: () => _appServices
    })

    const _modules = []
    Object.defineProperty(this, 'modules', {
      enumerable: true,
      get: () => _modules
    })
  }

  register (module) {
    if (module.reducer) {
      let reducerName = module.name.replace(/DATASOURCE/, '').toLowerCase()
      this.registerReducer(reducerName, module.reducer)
    }

    this.modules.push(module)

    this.emit('moduleDidRegister', this, module)
  }

  registerReducer (name, reducer) {
    this.reducers[name] = reducer
  }

  resolveRoutes () {
    let routes = this.modules
      .filter(m => !m.parent)
      .filter(m => !!m.routes)
      .map(m => this.resolveRoutesForModule(m))

    if (routes.length === 0) {
      throw new Error('No routes were setup. Check the kernel/bootup.js file.')
    }

    return routes
  }

  resolveRoutesForModule (m) {
    let children = this
      .getSubmodulesOf(m)
      .filter(m => !!m.routes)
      .map((c, i) => this.resolveRoutesForModule(c))

    return React.cloneElement(m.routes(this.store, children, this.appServices), {key: m.name})
  }

  getSubmodulesOf (module) {
    return this.modules.filter(m => m.parent === module.name)
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

  renderRoutes (id) {
    const root = document.getElementById(id)
    if (!root) {
      throw new Error(`DOM Node #${id} does not exist!`)
    }

    ReactDOM.render(
      <Provider store={this.store}>
        <Router history={this.history}>
          {this.resolveRoutes()}
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

    this.renderRoutes(id)

    this.emit('applicationDidStart', this)
  }
}

export default Application
