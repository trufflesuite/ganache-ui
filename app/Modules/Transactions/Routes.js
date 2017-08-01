import React from 'react'
import { IndexRoute, Route } from 'react-router'

import TransactionsContainer from './components/TransactionsContainer'
import RecentTxs from './components/txs/RecentTxs'
import TransactionDetail from './components/TransactionDetail'

export default function routes (store, children = null) {
  return (
    <Route path="transactions" component={TransactionsContainer} >
      <IndexRoute component={RecentTxs} />
      <Route path=":txhash" component={TransactionDetail} />
    </Route>
  )
}
