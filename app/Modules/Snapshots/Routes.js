import React from 'react'
import { Route } from 'react-router'

import Snapshots from './components/Snapshots'

export default function routes (store, children = null) {
  return (
    <Route path="/snapshots" component={Snapshots} />
  )
}
