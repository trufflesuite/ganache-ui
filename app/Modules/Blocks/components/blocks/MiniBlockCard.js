import React, { PureComponent } from 'react'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import FormattedHex from 'Elements/FormattedHex'

import Styles from './MiniBlockCard.css'

export default class MiniBlockCard extends PureComponent {
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
        key={`block_${EtherUtil.bufferToInt(block.header.number)}_detail`}
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
          <FormattedHex value={block.header.nonce} />
        </td>
        <td>
          <FormattedHex value={block.header.gasUsed} /> / <FormattedHex value={block.header.gasLimit} />
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
