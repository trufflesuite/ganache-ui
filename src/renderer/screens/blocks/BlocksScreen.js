import React, { Component } from 'react'
import connect from '../Helpers/connect'
import * as Blocks from '../../../redux/blocks/actions'
import BlockList from './BlockList'
import BlockCard from './BlockCard'

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
      <div className="BlocksScreen">
        {content}
      </div>
    )
  }
}

export default connect(BlockContainer, "blocks")