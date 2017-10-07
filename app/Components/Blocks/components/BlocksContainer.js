import React, { Component } from 'react'

import Styles from './Blocks.css'

import CoreProvider from 'Providers/Core'

import BlockList from 'Components/Blocks/components/blocks/BlockList'

class BlocksContainer extends Component {
  render () {
    return (
      <div className={Styles.Blocks}>
        <main>
          <BlockList
            blocks={this.props.core.blocks}
          />
        </main>
      </div>
    )
  }
}

export default CoreProvider(BlocksContainer)