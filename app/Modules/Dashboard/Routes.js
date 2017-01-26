import React from 'react'
import { Route } from 'react-router'

import Dashboard from './components/Dashboard'

export default function routes (store, children = null) {
  return (
    <Route path='/dashboard' component={Dashboard} />
  )
}
