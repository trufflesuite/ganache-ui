import React, {Component} from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import Styles from './AppUpdateScreen.css'

class AppUpdateScreen extends Component {
  render () {
    return (
      <h1>APP UPDATE SCREEN</h1>
    )
  }
}

export default TestRPCProvider(AppUpdateScreen)
