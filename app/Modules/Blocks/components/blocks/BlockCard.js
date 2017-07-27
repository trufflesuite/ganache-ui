import React, { Component } from 'react'

import FormattedHex from 'Elements/FormattedHex'
import TestRpcProvider from 'Data/Providers/TestRPCProvider'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import { hashHistory } from 'react-router'

import Styles from './BlockCard.css'

class BlockCard extends Component {
  _renderRecentTransaction = (transactions) => {
    if (transactions.length === 0) {
      return 'NO TRANSACTIONS'
    }

    return transactions.map((tx) => {
      const txHash = EtherUtil.bufferToHex(tx.hash)
      return (
        <a
          href="#"
          key={txHash}
          onClick={this._handleTxShow.bind(this, txHash)}>{txHash}</a>
      )
    })
  }

  _handleTxShow = (txHash, e) => {
    e.preventDefault()
    hashHistory.push(`/transactions/${txHash}`)
  }

  render () {
    const { block } = this.props

    if (!this.props.testRpcState.currentBlockSearchMatch) {
      return <h1>LOADING...</h1>
    }

    const hasTxs = block.transactions.length > 0

    const cardStyles = `${Styles.BlockCard} ${hasTxs ? Styles.HasTxs : ''}`

    return (
      <section className={cardStyles}>
        <dl>
          <dt>BLOCK #</dt>
          <dd>{EtherUtil.bufferToInt(block.header.number)}</dd>

          <dt>Block Hash</dt>
          <dd>{EtherUtil.bufferToHex(block.hash)}</dd>

          <dt>MINED ON</dt>
          <dd>
            <Moment unix format="YYYY-MM-DD HH:MM:SS">
              {EtherUtil.bufferToInt(block.header.timestamp)}
            </Moment>
          </dd>

          <dt>Parent Hash</dt>
          <dd>{EtherUtil.bufferToHex(block.header.parentHash)}</dd>

          <dt>Gas Used / Gas Limit</dt>
          <dd>{parseInt(EtherUtil.bufferToInt(block.header.gasUsed), 16)} / {parseInt(EtherUtil.bufferToInt(block.header.gasLimit), 16)}</dd>

          <dt>Nonce</dt>
          <dd>{parseInt(EtherUtil.bufferToInt(block.header.nonce, 16))}</dd>

          <dt>Extra Data</dt>
          <dd>
            {EtherUtil.bufferToHex(block.header.extraData)}
          </dd>

          <dt>Mix Hash</dt>
          <dd>{EtherUtil.bufferToHex(block.header.mixHash)}</dd>

          <dt>Receipts Root</dt>
          <dd>{EtherUtil.bufferToHex(block.header.receiptTrie)}</dd>

          <dt>Bloom</dt>
          <dd className={Styles.Bloom}>
            {EtherUtil.bufferToHex(block.header.bloom)}
          </dd>
        </dl>
        <dl>
          <dt>Transactions ({block.transactions.length})</dt>
          <dd>{ this._renderRecentTransaction(block.transactions) }</dd>
        </dl>
      </section>
    )
  }
}

export default TestRpcProvider(BlockCard)
