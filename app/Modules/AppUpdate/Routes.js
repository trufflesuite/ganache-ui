import React from 'react'
import { Route } from 'react-router'

import AppUpdateScreen from './components/AppUpdateScreen'

export default function routes (store, children = null) {
  return (
    <Route path='/app_update' component={props => <AppUpdateScreen {...props} />} />
  )
}
