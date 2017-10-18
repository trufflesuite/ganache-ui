import React, { Component } from 'react'
import { hashHistory } from 'react-router'
import connect from '../Helpers/connect'
import * as Transactions from '../../Actions/Transactions'

import EtherUtil from 'ethereumjs-util'
import Moment from 'react-moment'

import { Link } from 'react-router'

import DestinationAddress from './DestinationAddress'
import SenderAddress from './SenderAddress'
import TransactionTypeBadge from './TransactionTypeBadge'
import FormattedEtherValue from '../../Elements/FormattedEtherValue'
import FormattedHex from '../../Elements/FormattedHex'

import Styles from './TxCard.css'
import BorderStyles from './BorderStyles.css'
import EmptyTransactionStyles from './EmptyTransactions.css'

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

  componentDidMount () {
    this.props.dispatch(Transactions.showTransaction(this.props.transactionHash))
  }

  render () {
    const tx = this.props.transactions.currentTransaction
    const receipt = this.props.transactions.currentTransactionReceipt
    const cardStyles = `${this.borderStyleSelector(tx)} ${Styles.TxCard}`

    if (!tx || !receipt) {
      return <div />
    }

    return (
      <main>
        <section className={cardStyles}>
          <header className={BorderStyles.Header}>
            <button className="Styles.Button" onClick={hashHistory.goBack}>
              &larr; Back
            </button>

            <div className={BorderStyles.Title}>
              <h1>
                TX {tx.hash}
              </h1>
            </div>
          </header>

          <section className={BorderStyles.Parties}>
            <SenderAddress tx={tx} />
            <DestinationAddress tx={tx} receipt={receipt} />
            <div>
              <div className={Styles.Label}>VALUE</div>
              <div className={Styles.Value}>
                <FormattedEtherValue
                  value={tx.value.toString()}
                />
              </div>
            </div>
          </section>

          <section className={BorderStyles.Gas}>
            <div>
              <div className={Styles.Label}>TYPE</div>

              <div className={Styles.Value}>
                <div className={BorderStyles.Type}>
                  <TransactionTypeBadge tx={tx} receipt={receipt} />
                </div>
              </div>
            </div>

            <div>
              <div className={Styles.Label}>GAS USED</div>
              <div className={Styles.Value}>
                {receipt.gasUsed}
              </div>
            </div>

            <div>
              <div className={Styles.Label}>GAS PRICE</div>
              <div className={Styles.Value}>
                {tx.gasPrice.toString()}
              </div>
            </div>

            <div>
              <div className={Styles.Label}>GAS LIMIT</div>
              <div className={Styles.Value}>
                {tx.gas}
              </div>
            </div>

            {/* <div>
              <div className={Styles.Label}>MINED ON</div>
              <div className={Styles.Value}>
                <Moment unix format="YYYY-MM-DD HH:mm:ss">
                  {EtherUtil.bufferToInt(tx.block.header.timestamp)}
                </Moment>
              </div>
            </div> */}

            <div>
              <div className={Styles.Label}>MINED IN BLOCK</div>
              <div className={Styles.Value}>
                {receipt.blockNumber}
              </div>
            </div>
          </section>
          <main>
            <div>
              <div className={Styles.Label}>TX DATA</div>
              <div className={Styles.Value}>
                {tx.input}
              </div>
            </div>
          </main>
        </section>
      </main>
    )
  }
}

export default connect(TxCard, "transactions")
