import React from 'react'
import { IndexRoute, Route } from 'react-router'

import BlocksContainer from './components/BlocksContainer'
import RecentBlocks from './components/blocks/RecentBlocks'
import BlockCard from './components/blocks/BlockCard'

export default function routes (store, children = null) {
  return (
    <Route path="blocks" component={BlocksContainer}>
      <IndexRoute component={RecentBlocks} />
      <Route path=":block_number" component={BlockCard} />
    </Route>
  )
}
