import React from 'react'
import { Route } from 'react-router'

import Repl from './components/Repl'

export default function routes (store, children = null) {
  return (
    <Route path="/repl" component={Repl} />
  )
}
