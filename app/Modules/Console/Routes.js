import React from 'react'
import { Route } from 'react-router'

import Console from './components/Console'

export default function routes (store, children = null, appServices) {
  return (
    <Route path="/console" component={props => <Console {...props} appServices={appServices} />} />
  )
}
