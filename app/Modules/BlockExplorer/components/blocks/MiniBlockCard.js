import React, { Component } from 'react'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import Styles from './MiniBlockCard.css'

export default class MiniBlockCard extends Component {
  _renderRecentTransaction = (transactions) => {
    if (transactions.length === 0) {
      return 'NO TRANSACTIONS'
    }

    return transactions.map((tx) => {
      const txHash = EtherUtil.bufferToHex(tx.hash)
      return (
        <a href="#" onClick={this._handleTxShow.bind(this, txHash)}>{txHash}</a>
      )
    })
  }

  _showBlockDetail = () => {
    this.props.showBlockDetail(EtherUtil.bufferToInt(this.props.block.header.number))
  }

  render () {
    const { block } = this.props

    return (
      <tr
        className={Styles.MiniBlockCard}
        key={EtherUtil.bufferToHex(block.hash)}
        onClick={this._showBlockDetail}
      >
        <td>
          <div className={Styles.BlockNumber}>
            {EtherUtil.bufferToInt(block.header.number)}
          </div>
        </td>
        <td>
          {EtherUtil.bufferToHex(block.hash)}
        </td>
        <td>
          {EtherUtil.bufferToHex(block.header.nonce)}
        </td>
        <td>
          {EtherUtil.bufferToHex(block.header.gasUsed)} / {EtherUtil.bufferToHex(block.header.gasLimit)}
        </td>
        <td>
          <Moment unix format="YYYY-MM-DD HH:mm:ss">{EtherUtil.bufferToInt(block.header.timestamp)}</Moment>
        </td>

        <td>
          {block.transactions.length}
        </td>
      </tr>
    )
  }
}
