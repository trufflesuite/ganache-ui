import React, {Component} from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import Styles from './Dashboard.css'

class Dashboard extends Component {
  render () {
    return (
      <div className={Styles.Dashboard}>
        <h1>Dashboard</h1>
        <textarea value={this.props.logs.join('\n')}>
        </textarea>
      </div>
    )
  }
}

export default TestRPCProvider(Dashboard)
