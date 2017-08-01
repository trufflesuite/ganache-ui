import React, { Component } from 'react'
import TestRpcProvider from 'Data/Providers/TestRPCProvider'

import EtherUtil from 'ethereumjs-util'
import Moment from 'react-moment'

import { Link } from 'react-router'

import DestinationAddress from './DestinationAddress'
import SenderAddress from './SenderAddress'
import TransactionTypeBadge from './TransactionTypeBadge'
import FormattedEtherValue from 'Elements/FormattedEtherValue'
import FormattedHex from 'Elements/FormattedHex'

import Styles from './TxCard.css'
import BorderStyles from './BorderStyles.css'

class TxCard extends Component {
  borderStyleSelector = tx => {
    if (!tx) {
      return ''
    }

    if (tx.hasOwnProperty('contractAddress') && tx.contractAddress !== null) {
      return BorderStyles.ContractCreation
    }

    if (tx.to && tx.value > 0) {
      return BorderStyles.ValueTransfer
    }

    if (tx.to && tx.data) {
      return BorderStyles.ContractCall
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.txhash !== this.props.params.txhash) {
      this.props.appSearchTx(this.props.params.txhash)
    }
  }

  componentDidMount () {
    this.props.appSearchTx(this.props.params.txhash)
  }

  render () {
    const tx = this.props.testRpcState.currentTxSearchMatch
    const cardStyles = `${this.borderStyleSelector(tx)} ${Styles.TxCard}`

    if (!tx) {
      return <div></div>
    }

    return (
      <main>
        <Link to={'/transactions'} className={Styles.Button}>
          &larr; Back to All Transactions
        </Link>
        <section className={cardStyles}>
          <header className={BorderStyles.Header}>
            <div className={BorderStyles.Title}>
              <span>TX HASH</span>
              <h1>
                {tx.hash}
              </h1>
            </div>
            <div className={BorderStyles.Type}>
              <TransactionTypeBadge tx={tx} />
            </div>
          </header>
          <section className={BorderStyles.Parties}>
            <SenderAddress tx={tx} />
            <DestinationAddress tx={tx} />
            <div>
              <div className={Styles.Label}>NONCE</div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(tx.tx.nonce, 16))}
              </div>
            </div>
            <div>
              <div className={Styles.Label}>VALUE</div>
              <div className={Styles.Value}>
                <FormattedEtherValue
                  value={EtherUtil.bufferToInt(tx.tx.value, 16)}
                />
              </div>
            </div>
          </section>
          <section className={BorderStyles.Gas}>
            <div>
              <div className={Styles.Label}>GAS USED</div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(tx.gasUsed, 16))}
              </div>
            </div>
            <div>
              <div className={Styles.Label}>GAS PRICE</div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(tx.tx.gasPrice, 16))}
              </div>
            </div>
            <div>
              <div className={Styles.Label}>GAS LIMIT</div>
              <div className={Styles.Value}>
                {parseInt(EtherUtil.bufferToInt(tx.tx.gasLimit, 16))}
              </div>
            </div>
            <div>
              <div className={Styles.Label}>MINED ON</div>
              <div className={Styles.Value}>
                <Moment unix format="YYYY-MM-DD HH:mm:ss">
                  {EtherUtil.bufferToInt(tx.block.header.timestamp)}
                </Moment>
              </div>
            </div>
            <div>
              <div className={Styles.Label}>MINED IN BLOCK</div>
              <div className={Styles.Value}>
                {EtherUtil.bufferToInt(tx.block.header.number)}
              </div>
            </div>
          </section>
          <main>
            <div>
              <div className={Styles.Label}>TX DATA</div>
              <div className={Styles.Value}>
                {EtherUtil.bufferToHex(tx.tx.data)}
              </div>
            </div>
          </main>
          <footer>
            <div>
              <div className={Styles.Label}>V</div>
              <div className={Styles.Value}>
                <FormattedHex value={tx.tx.v} />
              </div>
            </div>
            <div>
              <div className={Styles.Label}>R</div>
              <div className={Styles.Value}>
                <FormattedHex value={tx.tx.r} />
              </div>
            </div>
            <div>
              <div className={Styles.Label}>S</div>
              <div className={Styles.Value}>
                <FormattedHex value={tx.tx.s} />
              </div>
            </div>
          </footer>
        </section>
      </main>
    )
  }
}

export default TestRpcProvider(TxCard)
