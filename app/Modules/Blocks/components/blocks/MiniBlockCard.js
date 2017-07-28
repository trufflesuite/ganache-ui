import React, { PureComponent } from 'react'
import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'
import Pluralize from 'pluralize'
import { hashHistory } from 'react-router'

import OnlyIf from 'Elements/OnlyIf'

import Styles from './MiniBlockCard.css'

export default class MiniBlockCard extends PureComponent {
  _renderRecentTransaction = transactions => {
    if (transactions.length === 0) {
      return 'NO TRANSACTIONS'
    }

    return transactions.map(tx => {
      const txHash = EtherUtil.bufferToHex(tx.hash)
      return (
        <a href="#" onClick={this._handleTxShow.bind(this, txHash)}>
          {txHash}
        </a>
      )
    })
  }

  _showBlockDetail = () => {
    hashHistory.push(
      `/blocks/${EtherUtil.bufferToInt(this.props.block.header.number)}`
    )
  }

  render () {
    const { block } = this.props
    const hasTxs = block.transactions.length > 0
    const cardStyles = `${Styles.MiniBlockCard} ${hasTxs ? Styles.HasTxs : ''}`
    const transactionCount = Pluralize('TRANSACTION', block.transactions.length)
    const blockNumber = EtherUtil.bufferToInt(block.header.number)

    return (
      <section
        className={cardStyles}
        key={`block_${blockNumber}_detail`}
        onClick={this._showBlockDetail}
      >
        <div className={Styles.RowItem}>
          <div className={Styles.BlockNumber}>
            <div className={Styles.Label}>BLOCK</div>
            <div className={Styles.Value}>
              {blockNumber}
            </div>
          </div>
        </div>
        <div className={Styles.PrimaryItems}>
          <div className={Styles.RowItem}>
            <div className={Styles.MinedOn}>
              <div className={Styles.Label}>MINED ON</div>
              <div className={Styles.Value}>
                <Moment unix format="YYYY-MM-DD HH:mm:ss">
                  {EtherUtil.bufferToInt(block.header.timestamp)}
                </Moment>
              </div>
            </div>
          </div>
          <div className={Styles.RowItem}>
            <div className={Styles.GasUsed}>
              <div className={Styles.Label}>GAS USED</div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(block.header.gasUsed), 16)}
              </div>
            </div>
          </div>
          <div className={Styles.RowItem}>
            <OnlyIf test={block.transactions.length > 0}>
              <div className={Styles.TransactionBadge}>
                {block.transactions.length}{' '}
                {Pluralize('TRANSACTION', block.transactions.length)}
              </div>
            </OnlyIf>
            <OnlyIf test={block.transactions.length === 0}>
              <div className={Styles.NoTransactionBadge}>
                NO TRANSACTIONS
              </div>
            </OnlyIf>
          </div>
        </div>
      </section>
    )
  }
}
