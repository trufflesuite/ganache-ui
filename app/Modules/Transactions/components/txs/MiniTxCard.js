
import React, { Component } from 'react'
import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'
import FormattedHex from 'Elements/FormattedHex'

import Styles from './MiniTxCard.css'

export default class MiniTxCard extends Component {
  render () {
    const { tx } = this.props

    const isContractCreationTx = tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null

    const cardStyles = `${Styles.MiniTxCard} ${isContractCreationTx ? Styles.CreatedContract : ''}`

    return (
      <div
        className={cardStyles}
        onClick={this.props.handleTxSearch.bind(this, EtherUtil.bufferToHex(tx.hash))}
        >

        <div className={Styles.Row}>

          <div className={Styles.RowItem}>
            <div className={Styles.TxHash}>
              <div className={Styles.Label}>
                TX HASH
              </div>
              <div className={Styles.Value}>
                {EtherUtil.bufferToHex(tx.hash)}
              </div>
            </div>
          </div>

          { isContractCreationTx
          ? <div className={Styles.RowItem}>
              <div className={Styles.ContractCallBadge}>CONTRACT CREATION</div>
            </div>
          : null
          }

        </div>

        <div className={Styles.Row}>
          <div className={Styles.RowItem}>
            <div className={Styles.From}>
              <div className={Styles.Label}>
                FROM
              </div>
              <div className={Styles.Value}>
                {tx.from}
              </div>
            </div>
          </div>

          <div className={Styles.RowItem}>
            <div className={Styles.To}>
              <div className={Styles.Label}>
                { isContractCreationTx ? `CONTRACT ADDRESS` : `TO` }
              </div>
              <div className={Styles.Value}>
                { isContractCreationTx
                  ? <div className={Styles.ContractCreationAddress}>
                  <span>{tx.contractAddress}</span>
                </div>
                : <div>{tx.to}</div> }
              </div>
            </div>
          </div>
        </div>

        <div className={Styles.Row}>

          <div className={Styles.RowItem}>
            <div className={Styles.Value}>
              <div className={Styles.Label}>
                VALUE
              </div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(tx.value), 16)}
              </div>
            </div>
          </div>

          <div className={Styles.RowItem}>
            <div className={Styles.Nonce}>
              <div className={Styles.Label}>
                NONCE
              </div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(tx.nonce), 16)}
              </div>
            </div>
          </div>

          <div className={Styles.RowItem}>
            <div className={Styles.GasUsed}>
              <div className={Styles.Label}>
                GAS USED
              </div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(tx.gasUsed), 16)}
              </div>
            </div>
          </div>

          <div className={Styles.RowItem}>
            <div className={Styles.MinedOn}>
              <div className={Styles.Label}>
                MINED ON
              </div>
              <div className={Styles.Value}>
                <Moment unix format="YYYY-MM-DD HH:mm:ss">{EtherUtil.bufferToInt(tx.block.header.timestamp)}</Moment>
              </div>
            </div>
          </div>

        </div>

      </div>
    )
  }
}
