import React, { Component } from 'react'
import RecentBlocks from './blocks/RecentBlocks'
import RecentTxs from './txs/RecentTxs'

import Styles from './Blocks.css'

export default class Blocks extends Component {
  render () {
    return (
      <div className={Styles.Blocks}>
        <RecentBlocks
          blocks={this.props.testRpcState.blocks}
          appSearchBlock={this.props.appSearchBlock}
          appSearchTx={this.props.appSearchTx}
          testRpcState={this.props.testRpcState}
        />
        <RecentTxs
          appSearchTx={this.props.appSearchTx}
          testRpcState={this.props.testRpcState}
        />
      </div>
    )
  }
}
