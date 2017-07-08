import React from 'react'
import { Route } from 'react-router'

import Transactions from './components/Transactions'

export default function routes (store, children = null) {
  return (
    <Route path="/transactions(/:txhash)" component={Transactions} />
  )
}
