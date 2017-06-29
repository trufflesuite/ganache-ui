import React, { PureComponent } from 'react'

import MiniTxCard from './MiniTxCard'
import Styles from './TxList.css'

export default class TxList extends PureComponent {
  render () {
    return (
      <table className={Styles.TxList}>
        <thead>
          <tr>
            <td>TX HASH</td>
            <td>NONCE </td>
            <td>VALUE</td>
            <td>FROM</td>
            <td>TO</td>
          </tr>
        </thead>
        <tbody>
          {this.props.transactions.map(this._renderMiniTxCard)}
        </tbody>
      </table>
    )
  }

  _handleTxSearch = (txHash) => {
    this.props.handleTxSearch(txHash)
  }

  _renderMiniTxCard = (tx) => {
    return (
      <MiniTxCard
        tx={tx}
        key={tx.hash}
        handleTxSearch={this.props.handleTxSearch}
        showTxDetail={this._handleTxSearch}
      />
    )
  }
}
