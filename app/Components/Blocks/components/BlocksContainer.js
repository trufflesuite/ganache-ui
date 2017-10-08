import React, { Component } from 'react'

import Styles from './Blocks.css'

import connect from 'Components/Helpers/connect'

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

export default connect(BlocksContainer, "core")