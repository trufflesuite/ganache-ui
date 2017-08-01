import React, { Component } from 'react'
import RecentBlocks from './blocks/RecentBlocks'

export default class Blocks extends Component {
  render () {
    return (
      <RecentBlocks
        blocks={this.props.testRpcState.blocks}
        appSearchBlock={this.props.appSearchBlock}
        appSearchTx={this.props.appSearchTx}
        testRpcState={this.props.testRpcState}
        params={this.props.params}
      />
    )
  }
}
