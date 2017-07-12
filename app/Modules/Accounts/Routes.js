import React from 'react'
import { Route } from 'react-router'

import Accounts from './components/Accounts'

export default function routes (store, children = null, appServices) {
  return (
    <Route path='/accounts' component={props => <Accounts {...props} appServices={appServices} />} />
  )
}
