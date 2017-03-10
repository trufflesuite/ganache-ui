import React from 'react'
import { Route } from 'react-router'

import Dashboard from './components/Dashboard'

export default function routes (store, children = null, appServices) {
  return (
    <Route path='/dashboard' component={props => <Dashboard {...props} appServices={appServices} />} />
  )
}
