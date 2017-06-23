
import React, { Component } from 'react'

import EtherUtil from 'ethereumjs-util'

import FormattedHex from 'Elements/FormattedHex'

import ContractIcon from 'babel!svg-react!../../../../../resources/Contract.svg?name=ContractIcon'
import Styles from './MiniTxCard.css'

export default class MiniTxCard extends Component {
  render () {
    const { tx } = this.props
    return (
      <tr
        className={Styles.MiniTxCard}
        onClick={this.props.handleTxSearch.bind(this, EtherUtil.bufferToHex(tx.hash))}
      >
        <td>
          <div className={Styles.Truncate}>{EtherUtil.bufferToHex(tx.hash)}</div>
        </td>
        <td>
          <FormattedHex value={tx.nonce} />
        </td>
        <td>
          <FormattedHex value={tx.value} />
        </td>
        <td>
          {tx.from}
        </td>
        <td>
          {
            tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null
              ? <div className={Styles.ContractCreationAddress}>
                <span>{tx.contractAddress}</span>
                <ContractIcon width={16} height={16} />
                </div>
              : <div>
                {tx.to}
              </div>
          }
        </td>
      </tr>
    )
  }
}
