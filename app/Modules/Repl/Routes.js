import React from 'react'
import { Route } from 'react-router'

import Repl from './components/Repl'

export default function routes (store, children = null, appServices) {
  return (
    <Route path="/repl" component={props => <Repl {...props} appServices={appServices} />} />
  )
}
