import React from 'react'
import { Route } from 'react-router'

import FirstRunScreen from './components/FirstRunScreen'

export default function routes (store, children = null) {
  return (
    <Route
      path="/first_run"
      component={props => <FirstRunScreen {...props} />}
    />
  )
}
