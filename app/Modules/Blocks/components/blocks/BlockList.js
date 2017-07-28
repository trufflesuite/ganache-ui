import React, { PureComponent } from 'react'
import EtherUtil from 'ethereumjs-util'
import MiniBlockCard from './MiniBlockCard'

import Styles from './BlockList.css'

export default class BlockList extends PureComponent {
  render () {
    return (
      <div className={Styles.BlockList}>
        {this.props.blocks.map(this._renderMiniBlockCard)}
      </div>
    )
  }

  _renderMiniBlockCard = (block) => {
    return (
      <MiniBlockCard
        block={block}
        key={EtherUtil.bufferToInt(block.header.number)}
        showBlockDetail={this.handleBlockNumberSearch}
      />
    )
  }
}
