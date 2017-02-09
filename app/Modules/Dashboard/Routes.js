import React from 'react'
import { Route } from 'react-router'

import Dashboard from './components/Dashboard'

function bounceToRoot (nextState, replace) {
  const { location } = nextState

  if (location.action !== 'PUSH') {
    replace('/')
  }
}

export default function routes (store, children = null) {
  return (
    <Route path='/dashboard' component={Dashboard} />
  )
}
