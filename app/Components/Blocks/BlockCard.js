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
        <section className={cardStyles}>
          <header className={Styles.Header}>
            <button className="Styles.Button" onClick={hashHistory.goBack}>
              &larr; Back
            </button>

            <div className={Styles.BlockNumber}>
              <h1>
                BLOCK {block.number}
              </h1>
            </div>
          </header>

          <main className={Styles.BlockBody}>
            <div className={Styles.HeaderSecondaryInfo}>
              <div>
                <div className={Styles.Label}>GAS USED</div>
                <div className={Styles.Value}>
                  {block.gasUsed}
                </div>
              </div>

              <div>
                <div className={Styles.Label}>GAS LIMIT</div>
                <div className={Styles.Value}>
                  {block.gasLimit}
                </div>
              </div>

              <div>
                <div className={Styles.Label}>MINED ON</div>
                <div className={Styles.Value}>
                  <Moment unix format="YYYY-MM-DD HH:MM:SS">
                    {block.timestamp}
                  </Moment>
                </div>
              </div>
            </div>

            <div>
              <div className={Styles.Item}>
                <div className={Styles.Label}>BLOCK HASH</div>
                <div className={Styles.Value}>
                  {block.hash}
                </div>
              </div>

              <div className={Styles.Item}>
                <div className={Styles.Label}>PARENT HASH</div>
                <div className={Styles.Value}>
                  {block.parentHash}
                </div>
              </div>

              {/*<div>
                <div className={Styles.Label}>NONCE</div>
                <div className={Styles.Value}>
                  {block.nonce}
                </div>
              </div>

              <div>
                <div className={Styles.Label}>EXTRA DATA</div>
                <div className={Styles.Value}>
                  {block.extraData}
                </div>
              </div>

              <div>
                <div className={Styles.Label}>MIX HASH</div>
                <div className={Styles.Value}>
                  {EtherUtil.bufferToHex(block.header.mixHash)}
                </div>
              </div>

              <div>
                <div className={Styles.Label}>RECEIPTS ROOT</div>
                <div className={Styles.Value}>
                  {EtherUtil.bufferToHex(block.header.receiptTrie)}
                </div>
              </div>

              <div>
                <div className={Styles.Label}>BLOOM</div>
                <div className={Styles.Value}>
                  {EtherUtil.bufferToHex(block.header.bloom)}
                </div>
              </div>*/}
            </div>

            <div>
              <div>
                <div className={Styles.Label}>TRANSACTIONS ({block.transactions.length})</div>
                <div className={Styles.Value}>
                  {this._renderRecentTransaction(block.transactions)}
                </div>
              </div>
            </div>
          </main>
        </section>
      </main>
    )
  }
}

export default connect(BlockCard, "blocks")
