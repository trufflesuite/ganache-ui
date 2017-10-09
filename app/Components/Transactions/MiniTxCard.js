import React, { Component } from 'react'
import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import { Link } from 'react-router'

import TransactionTypeBadge from './TransactionTypeBadge'
import DestinationAddress from './DestinationAddress'

import Styles from './MiniTxCard.css'
import BorderStyles from './BorderStyles.css'

export default class MiniTxCard extends Component {
  borderStyleSelector = tx => {
    if (tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null) {
      return BorderStyles.ContractCreation
    }

    if (tx.to && tx.value > 0) {
      return BorderStyles.ValueTransfer
    }

    if (tx.to && tx.data) {
      return BorderStyles.ContractCall
    }
  }

  render () {
    const { tx, receipt } = this.props

    const cardStyles = `${Styles.MiniTxCard} ${this.borderStyleSelector(tx)}`

    return (
      <Link
        to={`/transactions/${tx.hash}`}
        className={Styles.Link}
      >
        <div className={cardStyles}>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className={Styles.TxHash}>
                <div className={Styles.Label}>TX HASH</div>
                <div className={Styles.Value}>
                  {tx.hash}
                </div>
              </div>
            </div>

            <div className={Styles.RowItem}>
              <TransactionTypeBadge tx={tx} receipt={receipt} />
            </div>
          </div>

          <div className={Styles.SecondaryItems}>
            <div className={Styles.Row}>
              <div className={Styles.RowItem}>
                <div className={Styles.From}>
                  <div className={Styles.Label}>FROM ADDRESS</div>
                  <div className={Styles.Value}>
                    {tx.from}
                  </div>
                </div>
              </div>

              <div className={Styles.RowItem}>
                <DestinationAddress tx={tx} receipt={receipt} />
              </div>

              <div className={Styles.RowItem}>
                <div className={Styles.GasUsed}>
                  <div className={Styles.Label}>GAS USED</div>
                  <div className={Styles.Value}>
                    {receipt.gasUsed}
                  </div>
                </div>
              </div>

              <div className={Styles.RowItem}>
                <div className={Styles.Value}>
                  <div className={Styles.Label}>VALUE</div>
                  <div className={Styles.Value}>
                    {tx.value.toString()}
                  </div>
                </div>
              </div>

              {/* <div className={Styles.RowItem}>
                <div className={Styles.MinedOn}>
                  <div className={Styles.Label}>MINED ON</div>
                  <div className={Styles.Value}>
                    <Moment unix format="YYYY-MM-DD HH:mm:ss">
                      {EtherUtil.bufferToInt(tx.block.header.timestamp)}
                    </Moment>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </Link>
    )
  }
}
