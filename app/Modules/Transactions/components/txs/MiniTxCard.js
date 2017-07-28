import React, { Component } from 'react'
import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import TransactionTypeBadge from './TransactionTypeBadge'

import Styles from './MiniTxCard.css'

export default class MiniTxCard extends Component {
  borderStyleSelector = tx => {
    if (
      this.props.tx.hasOwnProperty('contractAddress') &&
      this.props.tx.contractAddress !== null
    ) {
      return Styles.ContractCreation
    }

    if (this.props.tx.to && this.props.tx.value > 0) {
      return Styles.ValueTransfer
    }

    if (this.props.tx.to && this.props.tx.data) {
      return Styles.ContractCall
    }
  }

  render () {
    const { tx } = this.props

    const isContractCall =
      (tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null) ||
      (tx.to && tx.data)

    const isContractCreationCall =
      tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null

    const cardStyles = `${Styles.MiniTxCard} ${this.borderStyleSelector()}`

    return (
      <div
        className={cardStyles}
        onClick={this.props.handleTxSearch.bind(
          this,
          EtherUtil.bufferToHex(tx.hash)
        )}
      >
        <div className={Styles.Row}>
          <div className={Styles.RowItem}>
            <div className={Styles.TxHash}>
              <div className={Styles.Label}>TX HASH</div>
              <div className={Styles.Value}>
                {EtherUtil.bufferToHex(tx.hash)}
              </div>
            </div>
          </div>

          <div className={Styles.RowItem}>
            <TransactionTypeBadge tx={tx} />
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
              <div className={Styles.To}>
                <div className={Styles.Label}>
                  {isContractCreationCall ? 'CREATED CONTRACT ADDRESS' : isContractCall ? `TO CONTRACT ADDRESS` : `TO ADDRESS`}
                </div>
                <div className={Styles.Value}>
                  {isContractCreationCall
                    ? <div className={Styles.ContractCreationAddress}>
                        <span>
                          {tx.contractAddress}
                        </span>
                      </div>
                    : <div>
                        {tx.to}
                      </div>}
                </div>
              </div>
            </div>

            <div className={Styles.RowItem}>
              <div className={Styles.GasUsed}>
                <div className={Styles.Label}>GAS USED</div>
                <div className={Styles.Value}>
                  {parseInt(EtherUtil.bufferToInt(tx.gasUsed), 16)}
                </div>
              </div>
            </div>

            <div className={Styles.RowItem}>
              <div className={Styles.Value}>
                <div className={Styles.Label}>VALUE</div>
                <div className={Styles.Value}>
                  {parseInt(EtherUtil.bufferToInt(tx.value), 16)}
                </div>
              </div>
            </div>

            <div className={Styles.RowItem}>
              <div className={Styles.MinedOn}>
                <div className={Styles.Label}>MINED ON</div>
                <div className={Styles.Value}>
                  <Moment unix format="YYYY-MM-DD HH:mm:ss">
                    {EtherUtil.bufferToInt(tx.block.header.timestamp)}
                  </Moment>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
}
