import React, { Component } from 'react'
import connect from '../Helpers/connect'
import * as Transactions from '../../Actions/Transactions'

import MiniTxCard from './MiniTxCard'
import Styles from './TxList.css'

import MiningIcon from '../../Elements/icons/force_mine.svg'
import Icon from '../../Elements/Icon'

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
    var content
    if (this.props.transactions.inView.length > 0) {
      content = this.props.transactions.inView.map((tx) => {
        return <MiniTxCard
          tx={tx}
          receipt={this.props.transactions.receipts[tx.hash]}
          key={`tx-${tx.hash}`}
        />
      })
    } else {
      content = 
        <div className={Styles.Waiting}>
            <Icon glyph={MiningIcon} size={64} />
            <p>
              Waiting for transactions...
            </p>
        </div>
    }

    return (
      <div className={Styles.TxList}>
        { content }
      </div>
    )
  }
}

export default connect(TxList, "transactions", "core", "appshell")