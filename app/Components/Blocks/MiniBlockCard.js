import React, { PureComponent } from 'react'
import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'
import Pluralize from 'pluralize'
import { Link } from 'react-router'

import OnlyIf from '../../Elements/OnlyIf'

import Styles from './MiniBlockCard.css'

export default class MiniBlockCard extends PureComponent {
  render () {
    const { block, transactionCount } = this.props
    const hasTxs = transactionCount > 0
    const cardStyles = `${Styles.MiniBlockCard} ${hasTxs ? Styles.HasTxs : ''}`

    return (
      <Link
        to={`/blocks/${this.props.block.number}`}
        className={Styles.Link}
      >
        <section className={cardStyles} key={`block_${block.number}_detail`}>
          <div className={Styles.RowItem}>
            <div className={Styles.BlockNumber}>
              <div className={Styles.Label}>BLOCK</div>
              <div className={Styles.Value}>
                {block.number}
              </div>
            </div>
          </div>
          <div className={Styles.PrimaryItems}>
            <div className={Styles.RowItem}>
              <div className={Styles.MinedOn}>
                <div className={Styles.Label}>MINED ON</div>
                <div className={Styles.Value}>
                  <Moment unix format="YYYY-MM-DD HH:mm:ss">
                    {block.timestamp}
                  </Moment>
                </div>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <div className={Styles.GasUsed}>
                <div className={Styles.Label}>GAS USED</div>
                <div className={Styles.Value}>
                  {block.gasUsed}
                </div>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <OnlyIf test={transactionCount > 0}>
                <div className={Styles.TransactionBadge}>
                  {transactionCount}{' '}
                  {Pluralize('TRANSACTION', transactionCount)}
                </div>
              </OnlyIf>
              <OnlyIf test={transactionCount === 0}>
                <div className={Styles.NoTransactionBadge}>NO TRANSACTIONS</div>
              </OnlyIf>
            </div>
          </div>
        </section>
      </Link>
    )
  }
}
