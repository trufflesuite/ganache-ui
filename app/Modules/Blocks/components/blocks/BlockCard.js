import React, { Component } from 'react'

import WithEmptyState from 'Elements/WithEmptyState'
import TestRpcProvider from 'Data/Providers/TestRPCProvider'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import { Link, hashHistory } from 'react-router'

import Styles from './BlockCard.css'

class LoadingSreen extends Component {
  render () {
    return <div className={Styles.LoadingBlock}>Loading Block</div>
  }
}

class BlockCard extends Component {
  _renderRecentTransaction = transactions => {
    if (transactions.length === 0) {
      return 'NO TRANSACTIONS'
    }

    return transactions.map(tx => {
      const txHash = EtherUtil.bufferToHex(tx.hash)
      return (
        <a
          href="#"
          key={txHash}
          onClick={this._handleTxShow.bind(this, txHash)}
        >
          {txHash}
        </a>
      )
    })
  }

  _handleTxShow = (txHash, e) => {
    e.preventDefault()
    hashHistory.push(`/transactions/${txHash}`)
  }

  componentDidMount () {
    this.props.appSearchBlock(this.props.params.block_number)
  }

  render () {
    const block = this.props.testRpcState.currentBlockSearchMatch
    const hasTxs = block && block.transactions.length > 0
    const cardStyles = `${Styles.BlockCard} ${hasTxs ? Styles.HasTxs : ''}`

    if (!block) {
      return <LoadingSreen />
    }

    return (
      <WithEmptyState emptyStateComponent={LoadingSreen} test={!block}>
        <main>
          <Link to={'/blocks'} className={Styles.Button}>
            &larr; Back to Blocks
          </Link>
          <section className={cardStyles}>
            <header className={Styles.Header}>
              <div className={Styles.BlockNumber}>
                <span>BLOCK NUMBER</span>
                <h1>
                  {EtherUtil.bufferToInt(block.header.number)}
                </h1>
              </div>
              <div className={Styles.HeaderSecondaryInfo}>
                <div className={Styles.GasUsed}>
                  <div>GAS USED</div>
                  <h1>
                    {parseInt(EtherUtil.bufferToInt(block.header.gasUsed), 16)}
                  </h1>
                </div>
                <div className={Styles.GasLimit}>
                  <div>GAS LIMIT</div>
                  <h1>
                    {parseInt(EtherUtil.bufferToInt(block.header.gasLimit), 16)}
                  </h1>
                </div>
                <div className={Styles.MinedOn}>
                  <div>MINED ON</div>
                  <h1>
                    <Moment unix format="YYYY-MM-DD HH:MM:SS">
                      {EtherUtil.bufferToInt(block.header.timestamp)}
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
                <dt>
                  BLOCK HASH
                </dt>
                <dd>
                  {EtherUtil.bufferToHex(block.hash)}
                </dd>
                <dt>Parent Hash</dt>
                <dd>
                  {EtherUtil.bufferToHex(block.header.parentHash)}
                </dd>

                <dt>Nonce</dt>
                <dd>
                  {parseInt(EtherUtil.bufferToInt(block.header.nonce, 16))}
                </dd>

                <dt>Extra Data</dt>
                <dd>
                  {EtherUtil.bufferToHex(block.header.extraData)}
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
                </dd>
              </dl>
            </main>
          </section>
        </main>
      </WithEmptyState>
    )
  }
}

export default TestRpcProvider(BlockCard)
