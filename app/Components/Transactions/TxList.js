import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'
import * as Transactions from 'Actions/Transactions'

import MiniTxCard from './MiniTxCard'
import Styles from './TxList.css'

class TxList extends Component {
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
      <div className={Styles.TxList}>
        {this.props.transactions.inView.map((tx) => {
          return <MiniTxCard
            tx={tx}
            receipt={this.props.transactions.receipts[tx.hash]}
            key={`tx-${tx.hash}`}
          />
        })}
      </div>
    )
  }
}

export default connect(TxList, "transactions", "core", "appshell")