import React, { Component } from 'react'
import connect from '../Helpers/connect'
import * as Transactions from '../../Actions/Transactions'
import RecentTransactions from './RecentTransactions'
import TxCard from './TxCard'

class TransactionsScreen extends Component {

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
      content = <RecentTransactions scrollPosition={this.props.scrollPosition} />
    }
    return (
      <div className="TransactionsScreen">
        <main>
          {content}
        </main>
      </div>
    )
  }
}

export default connect(TransactionsScreen)