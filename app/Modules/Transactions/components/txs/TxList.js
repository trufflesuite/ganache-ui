import React, { PureComponent } from 'react'

import MiniTxCard from './MiniTxCard'
import Styles from './TxList.css'

export default class TxList extends PureComponent {
  render () {
    return (
    <div className={Styles.TxList}>
      {this.props.transactions.map(this._renderMiniTxCard)}
    </div>
    )
  }

  _renderMiniTxCard = (tx) => {
    return (
      <MiniTxCard
        tx={tx}
        key={tx.hash}
        handleTxSearch={this.props.handleTxSearch}
        showTxDetail={this.props.handleTxSearch}
      />
    )
  }
}
