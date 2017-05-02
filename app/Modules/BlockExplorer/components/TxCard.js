
import React, { Component } from 'react'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import Styles from './TxCard.css'

export default class TxCard extends Component {
  render () {
    const { tx } = this.props

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
                  <dd>{EtherUtil.bufferToHex(tx.from)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>To</dt>
                  <dd>{EtherUtil.bufferToHex(tx.to)}</dd>
                </dl>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <dl>
                  <dt>Nonce</dt>
                  <dd>{EtherUtil.bufferToHex(tx.nonce)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>Value</dt>
                  <dd>{EtherUtil.bufferToHex(tx.value)}</dd>
                </dl>
              </td>
            </tr>
            <tr>
              <td>
                <dl>
                  <dt>Init</dt>
                  <dd>{EtherUtil.bufferToHex(tx.init)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>Value</dt>
                  <dd>{EtherUtil.bufferToHex(tx.value)}</dd>
                </dl>
              </td>
            </tr>
            <tr>
              <td>
                <dl>
                  <dt>Gas Price</dt>
                  <dd>{EtherUtil.bufferToHex(tx.gasPrice)}</dd>
                </dl>
              </td>
              <td>
                <dl>
                  <dt>Gas Limit</dt>
                  <dd>{EtherUtil.bufferToHex(tx.gasLimit)}</dd>
                </dl>
                <dl>
                  <dt>V</dt>
                  <dd>{EtherUtil.bufferToHex(tx.v)}</dd>
                </dl>
                <dl>
                  <dt>R</dt>
                  <dd>{EtherUtil.bufferToHex(tx.r)}</dd>
                </dl>
                <dl>
                  <dt>S</dt>
                  <dd>{EtherUtil.bufferToHex(tx.s)}</dd>
                </dl>
              </td>
            </tr>
            <tr>
              <td className={Styles.TxDataHex}>
                <dl>
                  <dt>Data</dt>
                  <dd className={Styles.TxData}>{EtherUtil.bufferToHex(tx.data)}</dd>
                </dl>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    )
  }
}
