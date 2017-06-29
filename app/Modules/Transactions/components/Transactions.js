import React, { Component } from 'react'
import RecentTxs from './txs/RecentTxs'

import Styles from './Transactions.css'

export default class Transactions extends Component {
  render () {
    return (
      <div className={Styles.Blocks}>
        <RecentTxs
          appSearchTx={this.props.appSearchTx}
          testRpcState={this.props.testRpcState}
        />
      </div>
    )
  }
}
