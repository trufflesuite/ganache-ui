import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'
import * as Blocks from 'Actions/Blocks'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import { Link, hashHistory } from 'react-router'

import Styles from './BlockCard.css'

class BlockCard extends Component {
  constructor(props) {
    super()
  }

  _renderRecentTransaction = transactions => {
    if (transactions.length === 0) {
      return 'NO TRANSACTIONS'
    }

    return transactions.map(tx => {
      return (
        <a
          href="#"
          key={tx.hash}
          onClick={this._handleTxShow.bind(this, tx.hash)}
        >
          {tx.hash}
        </a>
      )
    })
  }

  _handleTxShow = (txHash, e) => {
    e.preventDefault()
    hashHistory.push(`/transactions/${txHash}`)
  }

  componentDidMount () {
    this.props.dispatch(Blocks.showBlock(this.props.blockNumber))
  }

  render () {
    const block = this.props.blocks.currentBlock

    if (!block) {
      return <div />
    }

    const hasTxs = block.transactions.length > 0
    const cardStyles = `${Styles.BlockCard} ${hasTxs ? Styles.HasTxs : ''}`


    if (block.hasOwnProperty('error')) {
      return <section className={Styles.BlockSearchError}>
        <p>{block.error}</p>
      </section>
    }

    return (
      <main>
        <button className="Styles.Button" onClick={hashHistory.goBack}>
          &larr; Back
        </button>
        <section className={cardStyles}>
          <header className={Styles.Header}>
            <div className={Styles.BlockNumber}>
              <span>BLOCK NUMBER</span>
              <h1>
                {block.number}
              </h1>
            </div>
            <div className={Styles.HeaderSecondaryInfo}>
              <div className={Styles.GasUsed}>
                <div>GAS USED</div>
                <h1>
                  {block.gasUsed}
                </h1>
              </div>
              <div className={Styles.GasLimit}>
                <div>GAS LIMIT</div>
                <h1>
                  {block.gasLimit}
                </h1>
              </div>
              <div className={Styles.MinedOn}>
                <div>MINED ON</div>
                <h1>
                  <Moment unix format="YYYY-MM-DD HH:MM:SS">
                    {block.timestamp}
                  </Moment>
                </h1>
              </div>
            </div>
          </header>
          <main>
            <dl>
              <dt>
                Transactions ({block.transactions.length})
              </dt>
              <dd>
                {this._renderRecentTransaction(block.transactions)}
              </dd>
            </dl>
            <dl>
              <dt>BLOCK HASH</dt>
              <dd>
                {block.hash}
              </dd>
              <dt>Parent Hash</dt>
              <dd>
                {block.parentHash}
              </dd>

              {/* 
              <dt>Nonce</dt>
              <dd>
                {block.nonce}
              </dd>

              <dt>Extra Data</dt>
              <dd>
                {block.extraData}
              </dd>
              
              <dt>Mix Hash</dt>
              <dd>
                {EtherUtil.bufferToHex(block.header.mixHash)}
              </dd>

              <dt>Receipts Root</dt>
              <dd>
                {EtherUtil.bufferToHex(block.header.receiptTrie)}
              </dd>

              <dt>Bloom</dt>
              <dd className={Styles.Bloom}>
                {EtherUtil.bufferToHex(block.header.bloom)}
              </dd> */}
            </dl>
          </main>
        </section>
      </main>
    )
  }
}

export default connect(BlockCard, "blocks")