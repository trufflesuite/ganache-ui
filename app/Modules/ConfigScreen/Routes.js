import React from 'react'
import { Route } from 'react-router'

import ConfigScreen from './components/ConfigScreen'

export default function routes (store, children = null) {
  return (
    <Route path='/config' component={props => <ConfigScreen {...props} />} />
  )
}
