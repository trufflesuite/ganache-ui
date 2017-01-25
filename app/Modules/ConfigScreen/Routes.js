import React from 'react'
import { IndexRoute } from 'react-router'

import ConfigScreen from './components/ConfigScreen'

export default function routes (store, children = null) {
  return (
    <IndexRoute component={ConfigScreen} />
  )
}
