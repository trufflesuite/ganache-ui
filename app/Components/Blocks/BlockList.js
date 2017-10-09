import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'
import * as Blocks from 'Actions/Blocks'

import EtherUtil from 'ethereumjs-util'
import MiniBlockCard from './MiniBlockCard'

// TODO: Remove ContainerStyles
import ContainerStyles from './Blocks.css'
import Styles from './BlockList.css'

class BlockList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Blocks.requestPage())
  }

  componentWillUnmount() {
    this.props.dispatch(Blocks.clearBlocksInView())
  }

  componentWillReceiveProps(nextProps) {
    // If the scroll position changed...
    if (nextProps.scrollPosition != this.props.scrollPosition) {
      if (nextProps.scrollPosition == "top") {
        this.props.dispatch(Blocks.requestPreviousPage())
      } else if (nextProps.scrollPosition == "bottom") {
        this.props.dispatch(Blocks.requestNextPage())
      }
      return
    }

    // No change in scroll position? If a new block has been added,
    // request the previous page
    if (this.props.blocks.inView.length == 0) {
      return
    }

    var latestBlockInView = this.props.blocks.inView[0].number
    if (nextProps.scrollPosition == "top" && nextProps.core.latestBlock > latestBlockInView) {
      this.props.dispatch(Blocks.requestPreviousPage())
    }
  }
  
  render () {
    return (
      <div className={ContainerStyles.Blocks}>
        <main>
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
        </main>
      </div>
    )
  }
}

export default connect(BlockList, "blocks", "core")