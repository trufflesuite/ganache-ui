import React, { Component } from "react"
import { hashHistory } from "react-router"

import connect from "../helpers/connect"

import * as Transactions from "../../../common/redux/transactions/actions"

import DestinationAddress from "./DestinationAddress"
import TransactionTypeBadge from "./TransactionTypeBadge"

import FormattedEtherValue from "../../components/formatted-ether-value/FormattedEtherValue"

class TxCard extends Component {
  componentDidMount() {
    this.props.dispatch(
      Transactions.showTransaction(this.props.transactionHash)
    )
  }

  render() {
    const {
      currentTransaction: tx,
      currentTransactionReceipt: receipt
    } = this.props.transactions

    if (!tx || !receipt) {
      return <div />
    }

    return (
      <section className="TxCard">
        <div className="TxInfo">
          <header>
            <button className="Button" onClick={hashHistory.goBack}>
              &larr; Back
            </button>

            <div className="Title">
              <h1>TX {tx.hash}</h1>
            </div>
          </header>

          <section className="Parties">
            <div className="From">
              <div className="Label">SENDER ADDRESS</div>
              <div className="Value">{tx.from}</div>
            </div>
            <DestinationAddress tx={tx} receipt={receipt} />
            <div>
              <div className="Value">
                <div className="Type">
                  <TransactionTypeBadge tx={tx} receipt={receipt} />
                </div>
              </div>
            </div>
          </section>

          <section className="Gas">
            <div>
              <div className="Label">VALUE</div>
              <div className="Value">
                <FormattedEtherValue value={tx.value.toString()} />
              </div>
            </div>
            <div>
              <div className="Label">GAS USED</div>
              <div className="Value">{receipt.gasUsed}</div>
            </div>

            <div>
              <div className="Label">GAS PRICE</div>
              <div className="Value">{tx.gasPrice.toString()}</div>
            </div>

            <div>
              <div className="Label">GAS LIMIT</div>
              <div className="Value">{tx.gas}</div>
            </div>

            {/* <div>
              <div className="Label">MINED ON</div>
              <div className="Value">
                <Moment unix format="YYYY-MM-DD HH:mm:ss">
                  {EtherUtil.bufferToInt(tx.block.header.timestamp)}
                </Moment>
              </div>
            </div> */}

            <div>
              <div className="Label">MINED IN BLOCK</div>
              <div className="Value">{receipt.blockNumber}</div>
            </div>
          </section>
          <main>
            <div>
              <div className="Label">TX DATA</div>
              <div className="Value">{tx.input}</div>
            </div>
          </main>
        </div>

        <div className="ContractInfo">
          <header>
            <div className="Title">
              <h1>CONTRACT INFO</h1>
            </div>
          </header>

          <section>
            <div>
              <div className="Label">NAME</div>
              <div className="Value">ComplexTokenSent</div>
            </div>
            <div>
              <div className="Label">ADDRESS</div>
              <div className="Value">0xPLACEHOLDER_ADDRESS_HERE</div>
            </div>
          </section>

          <section>
            <div>
              <div className="Label">INPUTS</div>
              <div className="Value">5, "Jim"</div>
            </div>
            <div>
              <div className="Label">STATE CHANGES</div>
              <div className="Value">
                <div>ID: 3 >> 5</div>
                <div>Name: "Jimothy" >> "Jim"</div>
              </div>
            </div>
          </section>
        </div>
      </section>
    )
  }
}

export default connect(
  TxCard,
  "transactions"
)
