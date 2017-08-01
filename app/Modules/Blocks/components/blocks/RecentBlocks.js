import React, { Component } from 'react'
import BlockList from './BlockList'

import TestRpcProvider from 'Data/Providers/TestRPCProvider'

class RecentBlocks extends Component {
  render () {
    return (
      <main>
        <BlockList
          blocks={this.props.testRpcState.blocks}
        />
      </main>
    )
  }
}

export default TestRpcProvider(RecentBlocks)
