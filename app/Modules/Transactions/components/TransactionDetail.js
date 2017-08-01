import React, { Component } from 'react'

import TxCard from './txs/TxCard'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import Styles from './TransactionDetail.css'

class TransactionDetail extends Component {
  componentDidMount () {
    this.props.appSearchTx(this.props.params.txhash)
  }

  render () {
    const tx = this.props.testRpcState.currentTxSearchMatch

    return <TxCard className={Styles.Transaction} key={tx.hash} tx={tx} />
  }
}

export default TestRPCProvider(TransactionDetail)
