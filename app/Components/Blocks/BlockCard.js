import React, { Component } from 'react'
import connect from '../Helpers/connect'
import * as Blocks from '../../Actions/Blocks'
import * as Transactions from '../../Actions/Transactions'

import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import { Link, hashHistory } from 'react-router'

import TxList from '../Transactions/TxList'

class BlockCard extends Component {
  constructor(props) {
    super()
  }

  componentDidMount () {
    this.props.dispatch(Blocks.showBlock(this.props.blockNumber))
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.blocks.currentBlock != nextProps.blocks.currentBlock) {
      this.props.dispatch(Transactions.getReceipts(nextProps.blocks.currentBlock.transactions))
    }
  }

  render () {
    const block = this.props.blocks.currentBlock

    if (!block) {
      return <div />
    }

    return (
      <section className="BlockCard">
        <header className="Header">
          <button className="Button" onClick={hashHistory.goBack}>
            &larr; Back
          </button>

          <div className="BlockNumber">
            <h1>
              BLOCK {block.number}
            </h1>
          </div>
        </header>

          
        <div className="BlockBody">
          <div className="HeaderSecondaryInfo">
            <div>
              <div className="Label">GAS USED</div>
              <div className="Value">
                {block.gasUsed}
              </div>
            </div>

            <div>
              <div className="Label">GAS LIMIT</div>
              <div className="Value">
                {block.gasLimit}
              </div>
            </div>

            <div>
              <div className="Label">MINED ON</div>
              <div className="Value">
                <Moment unix format="YYYY-MM-DD HH:MM:SS">
                  {block.timestamp}
                </Moment>
              </div>
            </div>

            <div className="BlockHash">
              <div className="Label">BLOCK HASH</div>
              <div className="Value">
                {block.hash}
              </div>
            </div>
          </div>
        </div>
        <TxList transactions={block.transactions} receipts={this.props.transactions.receipts} />
      </section>
    )
  }
}

export default connect(BlockCard, "blocks", "transactions")
