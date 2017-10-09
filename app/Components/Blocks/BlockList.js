import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'
import * as Blocks from 'Actions/Blocks'

import EtherUtil from 'ethereumjs-util'
import MiniBlockCard from './MiniBlockCard'

import Styles from './BlockList.css'

class BlockList extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    // If the scroll position changed...
    if (nextProps.appshell.scrollPosition != this.props.appshell.scrollPosition) {
      if (nextProps.appshell.scrollPosition == "top") {
        this.props.dispatch(Blocks.requestPreviousPage())
      } else if (nextProps.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Blocks.requestNextPage())
      }
      return
    }

    // No change in scroll position? If a new block has been added,
    // request the previous page
    if (nextProps.blocks.inView.length == 0) {
      return
    }

    var latestBlockInView = nextProps.blocks.inView[0].number
    if (nextProps.appshell.scrollPosition == "top" && nextProps.core.latestBlock > latestBlockInView) {
      this.props.dispatch(Blocks.requestPreviousPage())
    }
  }
  
  render () {
    return (
      <div className={Styles.BlockList} ref="container">
        {this.props.blocks.inView.map((block) => {
          return (
            <MiniBlockCard
              key={`block-${block.number}`}
              block={block}
            />
          )
        })}
      </div>
    )
  }
}

export default connect(BlockList, "blocks", "core", "appshell")