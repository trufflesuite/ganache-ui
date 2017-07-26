import React, { PureComponent } from 'react'
import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'
import FormattedHex from 'Elements/FormattedHex'
import Pluralize from 'pluralize'
import { hashHistory } from 'react-router'

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
    hashHistory.push(`/blocks/${EtherUtil.bufferToInt(this.props.block.header.number)}`)
  }

  render () {
    const { block } = this.props
    const hasTxs = block.transactions.length > 0

    const cardStyles = `${Styles.MiniBlockCard} ${hasTxs ? Styles.HasTxs : ''}`

    return (
      <section
        className={cardStyles}
        key={`block_${EtherUtil.bufferToInt(block.header.number)}_detail`}
        onClick={this._showBlockDetail}
      >
        <div className={Styles.RowItem}>
          <div className={Styles.BlockNumber}>
            <div className={Styles.Label}>
              BLOCK NUMBER
            </div>
            <div className={Styles.Value}>
              {EtherUtil.bufferToInt(block.header.number)}
            </div>
          </div>
          {
            block.transactions.length > 0
            ? <div className={Styles.TransactionBadge}>{block.transactions.length} {Pluralize('TRANSACTION', block.transactions.length)}</div>
            : null
          }
        </div>
        <div className={Styles.RowItem}>
          <div className={Styles.BlockHash}>
            <div className={Styles.Label}>
              BLOCK HASH
            </div>
            <div className={Styles.Value}>
              {EtherUtil.bufferToHex(block.hash)}
            </div>
          </div>
        </div>
        <div className={Styles.RowItem}>
          <div className={Styles.GasUsed}>
            <div className={Styles.Label}>
              GAS USED
            </div>
            <div className={Styles.Value}>
              <FormattedHex value={block.header.gasUsed} />
            </div>
          </div>
          <div className={Styles.MinedOn}>
            <div className={Styles.Label}>
              MINED ON
            </div>
            <div className={Styles.Value}>
              <Moment unix format="YYYY-MM-DD HH:mm:ss">{EtherUtil.bufferToInt(block.header.timestamp)}</Moment>
            </div>
          </div>
        </div>
      </section>
    )
  }
}
