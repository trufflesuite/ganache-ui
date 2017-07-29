import React, { Component } from 'react'
import TestRpcProvider from 'Data/Providers/TestRPCProvider'
import FormattedHex from 'Elements/FormattedHex'

import EtherUtil from 'ethereumjs-util'

import DestinationAddress from './DestinationAddress'

import Styles from './TxCard.css'

class TxCard extends Component {
  render () {
    const tx = this.props.testRpcState.currentTxSearchMatch
    const cardStyles = `${Styles.TxCard}`

    return (
      <section className={cardStyles}>
        <dl>
          <dt>Transaction Hash</dt>
          <dd>
            {tx.hash}
          </dd>
          <dt>From</dt>
          <dd>
            {tx.from}
          </dd>
          <dt>Value</dt>
          <dd>
            {parseInt(EtherUtil.bufferToInt(tx.tx.value, 16))}
          </dd>
          <dt>Gas Used</dt>
          <dd>
            {parseInt(EtherUtil.bufferToInt(tx.gasUsed, 16))}
          </dd>
          <dt>Gas Price</dt>
          <dd>
            {parseInt(EtherUtil.bufferToInt(tx.tx.gasPrice, 16))}
          </dd>
          <dt>Nonce</dt>
          <dd>
            {parseInt(EtherUtil.bufferToInt(tx.tx.nonce, 16))}
          </dd>
          <dt>Gas Limit</dt>
          <dd>
            {parseInt(EtherUtil.bufferToInt(tx.tx.gasLimit, 16))}
          </dd>
        </dl>
        <dl>
          <DestinationAddress tx={tx} />
          <dt>V</dt>
          <dd>
            <FormattedHex value={tx.tx.v} />
          </dd>
          <dt>R</dt>
          <dd>
            <FormattedHex value={tx.tx.r} />
          </dd>
          <dt>S</dt>
          <dd>
            <FormattedHex value={tx.tx.s} />
          </dd>
          <dt>Data</dt>
          <dd className={Styles.TxDataHex}>
            {EtherUtil.bufferToHex(tx.tx.data)}
          </dd>
        </dl>
      </section>
    )
  }
}

export default TestRpcProvider(TxCard)
