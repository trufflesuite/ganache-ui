
import React, { Component } from 'react'

import EtherUtil from 'ethereumjs-util'

import Styles from './TxCard.css'

export default class TxCard extends Component {
  render () {
    const { tx } = this.props

    console.log(tx)
    return (
      <section className={Styles.TxCard}>
        <table className={Styles.TxData}>
          <thead className={Styles.TxHeader}>
            <tr>
              <td>
                <dl>
                  <dt>Transaction Hash</dt>
                  <dd>{EtherUtil.bufferToHex(tx.hash)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>From</dt>
                  <dd>{EtherUtil.bufferToHex(tx.tx.from)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>To</dt>
                  <dd>{EtherUtil.bufferToHex(tx.tx.to)}</dd>
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
                                  <dd>{EtherUtil.bufferToHex(tx.tx.value)}</dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Gas Price</dt>
                                  <dd>{EtherUtil.bufferToHex(tx.tx.gasPrice)}</dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Nonce</dt>
                                  <dd>{EtherUtil.bufferToHex(tx.tx.nonce)}</dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Gas Price</dt>
                                  <dd>{EtherUtil.bufferToHex(tx.tx.gasPrice)}</dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>Gas Limit</dt>
                                  <dd>{EtherUtil.bufferToHex(tx.tx.gasLimit)}</dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>V</dt>
                                  <dd>{EtherUtil.bufferToHex(tx.tx.v)}</dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>R</dt>
                                  <dd>{EtherUtil.bufferToHex(tx.tx.r)}</dd>
                                </dl>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <dl>
                                  <dt>S</dt>
                                  <dd>{EtherUtil.bufferToHex(tx.tx.s)}</dd>
                                </dl>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td rowSpan="6">
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
