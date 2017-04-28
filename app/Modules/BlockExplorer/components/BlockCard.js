import React, { Component } from 'react'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import Styles from './BlockCard.css'

export default class BlockCard extends Component {
  _renderRecentTransaction = (transactions) => {
    if (transactions.length === 0) {
      return 'NO TRANSACTIONS'
    }

    return transactions.map((tx) => {
      const txHash = EtherUtil.bufferToHex(tx.hash)
      return (
        <a href="#" onClick={this._handleTxShow.bind(this, txHash)}>{txHash}</a>
      )
    })
  }

  render () {
    const { block } = this.props

    return (
      <section className={Styles.BlockCard}>
        <main>
          <div className={Styles.BlockNumber}>
            <div>{EtherUtil.bufferToInt(block.header.number)}</div>
            <div>Block #</div>
          </div>
          <table className={Styles.BlockData}>
            <tr>
              <td>
                <dl>
                  <dt>Block Hash</dt>
                  <dd>{EtherUtil.bufferToHex(block.hash)}</dd>
                </dl>
              </td>
              <td>
                <table>
                  <tr>
                    <td>
                      <dl>
                        <dt>Nonce</dt>
                        <dd>{EtherUtil.bufferToHex(block.header.nonce)}</dd>
                      </dl>
                    </td>
                    <td>
                      <dl>
                        <dt>Gas Used / Gas Limit</dt>
                        <dd>{EtherUtil.bufferToHex(block.header.gasUsed)} / {EtherUtil.bufferToHex(block.header.gasLimit)}</dd>
                      </dl>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <dl>
                  <dt>Transactions ({block.transactions.length})</dt>
                  <dd>{
                    this._renderRecentTransaction(block.transactions)
                  }</dd>
              </dl>
              <dl>
                <dt>Bloom</dt>
                <dd className={Styles.Bloom}>{EtherUtil.bufferToHex(block.header.bloom)}</dd>
              </dl>
            </td>
            <td>
              <dl>
                <dt>Parent Hash</dt>
                <dd>{EtherUtil.bufferToHex(block.header.parentHash)}</dd>
              </dl>
              <dl>
              </dl>
              <dl>
                <dt>Mined On</dt>
                <dd><Moment unix>{EtherUtil.bufferToInt(block.header.timestamp)}</Moment></dd>
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
                <dt>State Root</dt>
                <dd>{EtherUtil.bufferToHex(block.header.stateRoot)}</dd>
              </dl>
              <dl>
                <dt>Extra Data</dt>
                <dd><pre>{EtherUtil.bufferToHex(block.header.extraData)}</pre></dd>
              </dl>
            </td>
            </tr>
            </table>

          </main>
        </section>
    )
  }
}
