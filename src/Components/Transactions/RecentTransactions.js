import React, { Component } from 'react'
import connect from '../Helpers/connect'
import * as Transactions from '../../Actions/Transactions'

import TxList from './TxList'

import MiningIcon from '../../Elements/icons/force_mine.svg'

class RecentTransactions extends Component {
  componentWillReceiveProps(nextProps) {
    // If the scroll position changed...
    if (nextProps.appshell.scrollPosition != this.props.appshell.scrollPosition) {
      if (nextProps.appshell.scrollPosition == "top") {
        this.props.dispatch(Transactions.requestPreviousPage())
      } else if (nextProps.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Transactions.requestNextPage())
      }
      return
    }

    // No change in scroll position? 
    var blocksRequested = Object.keys(nextProps.transactions.blocksRequested)
    var latestBlockRequested = Math.max.apply(Math, blocksRequested.concat(-1))
    if (nextProps.appshell.scrollPosition == "top" && nextProps.core.latestBlock > latestBlockRequested) {
      this.props.dispatch(Transactions.requestPreviousPage())
    }
  }

  render () {
    return (
      <div className="RecentTransactions">
        <TxList transactions={this.props.transactions.inView} receipts={this.props.transactions.receipts} />
      </div>
    )
  }
}

export default connect(RecentTransactions, "transactions", "core", "appshell")