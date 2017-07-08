import React from 'react'
import { Route } from 'react-router'

import Blocks from './components/Blocks'

export default function routes (store, children = null) {
  return (
    <Route  path="/blocks" component={Blocks}>
      <Route path=":block_number" component={Blocks} />
    </Route>
  )
}
