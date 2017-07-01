import React, { Component } from 'react'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import FormattedHex from 'Elements/FormattedHex'

import Styles from './BlockCard.css'

export default class BlockCard extends Component {
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
    this.props.handleTxSearch(txHash)
  }

  render () {
    const { block } = this.props

    return (
      <section className={Styles.BlockCard}>
        <dl>
          <dt>BLOCK #</dt>
          <dd>{EtherUtil.bufferToInt(block.header.number)}</dd>
        </dl>
        <dl>
          <dt>Block Hash</dt>
          <dd>{EtherUtil.bufferToHex(block.hash)}</dd>
        </dl>
        <dl>
          <dt>MINED ON</dt>
          <dd>
            <Moment unix format="YYYY-MM-DD HH:MM:SS">
              {EtherUtil.bufferToInt(block.header.timestamp)}
            </Moment>
          </dd>
        </dl>
        <dl>
          <dt>Parent Hash</dt>
          <dd>{EtherUtil.bufferToHex(block.header.parentHash)}</dd>
        </dl>
        <dl>
          <dt>Gas Used / Gas Limit</dt>
          <dd><FormattedHex value={block.header.gasUsed} /> / <FormattedHex value={block.header.gasLimit} /></dd>
        </dl>
        <dl>
          <dt>Nonce</dt>
          <dd><FormattedHex value={block.header.nonce} /></dd>
        </dl>
        <dl>
          <dt>Extra Data</dt>
          <dd>
            <pre>
              {EtherUtil.bufferToHex(block.header.extraData)}
            </pre>
          </dd>
        </dl>
        <dl>
          <dt>Mix Hash</dt>
          <dd>{EtherUtil.bufferToHex(block.header.mixHash)}</dd>
        </dl>
        <dl>
          <dt>Receipts Root</dt>
          <dd>{EtherUtil.bufferToHex(block.header.receiptTrie)}</dd>
        </dl>
        <dl>
          <dt>Bloom</dt>
          <dd className={Styles.Bloom}>
            {EtherUtil.bufferToHex(block.header.bloom)}
          </dd>
        </dl>
        <dl>
          <dt>Transactions ({block.transactions.length})</dt>
          <dd>{
            this._renderRecentTransaction(block.transactions)
          }</dd>
      </dl>
    </section>
    )
  }
}
