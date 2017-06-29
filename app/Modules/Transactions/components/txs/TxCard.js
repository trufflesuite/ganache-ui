import React, { Component } from 'react'

import FormattedHex from 'Elements/FormattedHex'

import EtherUtil from 'ethereumjs-util'

import Styles from './TxCard.css'

export default class TxCard extends Component {
  render () {
    const { tx } = this.props

    const isContractCreationTx = tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null

    return (
      <section className={Styles.TxCard}>
        <table className={Styles.TxData}>
          <thead className={Styles.TxHeader}>
            <tr>
              <td>
                <dl>
                  <dt>Transaction Hash</dt>
                  <dd>{tx.hash}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>From</dt>
                  <dd>{tx.from}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>{isContractCreationTx ? 'CONTRACT CREATION ADDRESS' : 'To'}</dt>
                  <dd>{isContractCreationTx ? tx.contractAddress : tx.to}</dd>
                </dl>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="3">
                <table className={Styles.SmallGroup}>
                  <tbody>
                    <tr>
                      <td>
                        <table>
                          <tbody>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Value</dt>
                                  <dd><FormattedHex value={tx.tx.value} /></dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Gas Used</dt>
                                  <dd><FormattedHex value={tx.gasUsed} /></dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Gas Price</dt>
                                  <dd><FormattedHex value={tx.tx.gasPrice} /></dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Nonce</dt>
                                  <dd><FormattedHex value={tx.tx.nonce} /></dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Gas Limit</dt>
                                  <dd><FormattedHex value={tx.tx.gasLimit} /></dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>V</dt>
                                  <dd><FormattedHex value={tx.tx.v} /></dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>R</dt>
                                  <dd><FormattedHex value={tx.tx.r} /></dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>S</dt>
                                  <dd><FormattedHex value={tx.tx.s} /></dd>
                                </dl>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td rowSpan="6" className={Styles.TxDataHexContainer}>
                        <dl>
                          <dt>Data</dt>
                          <dd className={Styles.TxDataHex}>{EtherUtil.bufferToHex(tx.tx.data)}</dd>
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
