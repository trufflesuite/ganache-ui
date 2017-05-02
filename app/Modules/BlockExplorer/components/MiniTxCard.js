
import React, { Component } from 'react'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import Styles from './MiniTxCard.css'

export default class MiniTxCard extends Component {

  render () {
    const { tx } = this.props
    return (
      <tr
        className={Styles.MiniTxCard}
      >
        <td>
          <div className={Styles.Truncate}>{EtherUtil.bufferToHex(tx.hash)}</div>
        </td>
        <td>
          {EtherUtil.bufferToHex(tx.from)}
        </td>
        <td>
          {EtherUtil.bufferToHex(tx.to)}
        </td>
        <td>
          {EtherUtil.bufferToHex(tx.nonce)}
        </td>
        <td>
          {EtherUtil.bufferToHex(tx.value)}
        </td>
      </tr>
    )
  }
}
