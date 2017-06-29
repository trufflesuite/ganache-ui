import React, { PureComponent } from 'react'
import EtherUtil from 'ethereumjs-util'

import MiniBlockCard from './MiniBlockCard'
import Styles from './BlockList.css'

export default class BlockList extends PureComponent {
  render () {
    return (
      <table className={Styles.BlockList}>
        <thead>
          <tr>
            <td>BLOCK #</td>
            <td>BLOCK HASH</td>
            <td>NONCE </td>
            <td>GAS USED / GAS LIMIT</td>
            <td>Mined On</td>
            <td>TX COUNT</td>
          </tr>
        </thead>
        <tbody>
          {this.props.blocks.map(this._renderMiniBlockCard)}
        </tbody>
      </table>
    )
  }

  _handleBlockNumberSearch = (bkNumber) => {
    this.props.handleBlockNumberSearch(bkNumber)
  }

  _renderMiniBlockCard = (block) => {
    return (
      <MiniBlockCard
        block={block}
        key={EtherUtil.bufferToInt(block.header.number)}
        showBlockDetail={this._handleBlockNumberSearch}
      />
    )
  }
}
