import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'
import * as Blocks from 'Actions/Blocks'
import BlockList from 'Components/Blocks/BlockList'
import BlockCard from 'Components/Blocks/BlockCard'

import Styles from './Blocks.css'

class BlockContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Blocks.requestPage())
  }

  componentWillUnmount() {
    this.props.dispatch(Blocks.clearBlocksInView())
  }
  
  render () {
    var content
    if (this.props.params.blockNumber != null) {
      content = <BlockCard blockNumber={this.props.params.blockNumber} />
    } else {
      content = <BlockList scrollPosition={this.props.scrollPosition} />
    }
    return (
      <div className={Styles.Blocks}>
        <main>
          {content}
        </main>
      </div>
    )
  }
}

export default connect(BlockContainer, "blocks")