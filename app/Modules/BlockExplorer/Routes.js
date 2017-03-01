import React from 'react'
import { Route } from 'react-router'

import BlockExplorer from './components/BlockExplorer'

export default function routes (store, children = null) {
  return (
    <Route path="/block_explorer" component={BlockExplorer} />
  )
}
