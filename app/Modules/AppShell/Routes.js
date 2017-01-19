import React from 'react'
import { Route } from 'react-router'

import AppShell from './components/AppShell'

export default function routes (store, children = null) {
  return (
    <Route path="/" component={AppShell}>
      {children}
    </Route>
  )
}
