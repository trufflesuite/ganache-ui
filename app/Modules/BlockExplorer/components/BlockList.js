import React, { Component } from 'react'

import MiniBlockCard from './MiniBlockCard'
import Styles from './BlockList.css'

export default class BlockList extends Component {
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
        key={block.hash}
        showBlockDetail={this._handleBlockNumberSearch}
      />
    )
  }
}
