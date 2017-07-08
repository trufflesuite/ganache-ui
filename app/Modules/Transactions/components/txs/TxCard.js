import React, { Component } from 'react'
import TestRpcProvider from 'Data/Providers/TestRPCProvider'
import FormattedHex from 'Elements/FormattedHex'

import EtherUtil from 'ethereumjs-util'

import Styles from './TxCard.css'

class TxCard extends Component {
  render () {
    const tx = this.props.testRpcState.currentTxSearchMatch

    const isContractCreationTx = tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null

    return (
      <section className={Styles.TxCard}>
        <dl>
          <dt>Transaction Hash</dt>
          <dd>{tx.hash}</dd>
          <dt>From</dt>
          <dd>{tx.from}</dd>
          <dt>{isContractCreationTx ? 'CONTRACT CREATION ADDRESS' : 'To'}</dt>
          <dd>{isContractCreationTx ? tx.contractAddress : tx.to}</dd>
          <dt>Value</dt>
          <dd><FormattedHex value={tx.tx.value} /></dd>
          <dt>Gas Used</dt>
          <dd><FormattedHex value={tx.gasUsed} /></dd>
          <dt>Gas Price</dt>
          <dd><FormattedHex value={tx.tx.gasPrice} /></dd>
          <dt>Nonce</dt>
          <dd><FormattedHex value={tx.tx.nonce} /></dd>
          <dt>Gas Limit</dt>
          <dd><FormattedHex value={tx.tx.gasLimit} /></dd>
        </dl>
        <dl>
          <dt>V</dt>
          <dd><FormattedHex value={tx.tx.v} /></dd>
          <dt>R</dt>
          <dd><FormattedHex value={tx.tx.r} /></dd>
          <dt>S</dt>
          <dd><FormattedHex value={tx.tx.s} /></dd>
          <dt>Data</dt>
          <dd className={Styles.TxDataHex}>{EtherUtil.bufferToHex(tx.tx.data)}</dd>
        </dl>
      </section>
    )
  }
}

export default TestRpcProvider(TxCard)
