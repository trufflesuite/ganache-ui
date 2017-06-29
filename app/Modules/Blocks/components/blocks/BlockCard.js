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
        <table className={Styles.BlockData}>
          <thead className={Styles.BlockHeader}>
            <tr>
              <td>
                <dl>
                  <dt>BLOCK #</dt>
                  <dd>{EtherUtil.bufferToInt(block.header.number)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>Block Hash</dt>
                  <dd>{EtherUtil.bufferToHex(block.hash)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>MINED ON</dt>
                  <dd>
                    <Moment unix format="YYYY-MM-DD HH:MM:SS">
                      {EtherUtil.bufferToInt(block.header.timestamp)}
                    </Moment>
                  </dd>
                </dl>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="3" className={Styles.Container}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <dl>
                          <dt>Parent Hash</dt>
                          <dd>{EtherUtil.bufferToHex(block.header.parentHash)}</dd>
                        </dl>
                      </td>
                      <td>
                        <table className={Styles.SmallGroup}>
                          <tbody>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Gas Used / Gas Limit</dt>
                                  <dd><FormattedHex value={block.header.gasUsed} /> / <FormattedHex value={block.header.gasLimit} /></dd>
                                </dl>
                              </td>
                              <td>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <dl>
                          <dt>Nonce</dt>
                          <dd><FormattedHex value={block.header.nonce} /></dd>
                        </dl>
                      </td>
                      <td>
                        <dl>
                          <dt>Extra Data</dt>
                          <dd>
                            <pre>
                              {EtherUtil.bufferToHex(block.header.extraData)}
                            </pre>
                          </dd>
                        </dl>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <dl>
                          <dt>Mix Hash</dt>
                          <dd>{EtherUtil.bufferToHex(block.header.mixHash)}</dd>
                        </dl>
                      </td>
                      <td>
                        <dl>
                          <dt>Receipts Root</dt>
                          <dd>{EtherUtil.bufferToHex(block.header.receiptTrie)}</dd>
                        </dl>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <dl>
                          <dt>Bloom</dt>
                          <dd className={Styles.Bloom}>
                            {EtherUtil.bufferToHex(block.header.bloom)}
                          </dd>
                        </dl>
                      </td>
                      <td className={Styles.VAlignTop}>
                        <dl>
                          <dt>Transactions ({block.transactions.length})</dt>
                          <dd>{
                            this._renderRecentTransaction(block.transactions)
                          }</dd>
                      </dl>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    )
  }
}
