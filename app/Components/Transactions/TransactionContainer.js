import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'
import * as Transactions from 'Actions/Transactions'
import TxList from 'Components/Transactions/TxList'
import TxCard from 'Components/Transactions/TxCard'

import Styles from './Transactions.css'

class TransactionContainer extends Component {

  componentDidMount() {
    this.props.dispatch(Transactions.requestPage())
  }

  componentWillUnmount() {
    this.props.dispatch(Transactions.clearTransactionsInView())
  }
  
  render () {
    var content
    if (this.props.params.transactionHash != null) {
      content = <TxCard transactionHash={this.props.params.transactionHash} />
    } else {
      content = <TxList scrollPosition={this.props.scrollPosition} />
    }
    return (
      <div className={Styles.Transactions}>
        <main>
          {content}
        </main>
      </div>
    )
  }
}

export default TransactionContainer