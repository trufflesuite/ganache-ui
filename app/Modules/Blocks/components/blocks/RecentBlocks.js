
import React, { Component } from 'react'

import BlockCard from './BlockCard'
import BlockList from './BlockList'

import EtherUtil from 'ethereumjs-util'
import Icon from 'Elements/Icon'

import Styles from './RecentBlocks.css'
import BlocksStyles from '../Blocks.css'

export default class RecentBlocks extends Component {
  constructor (props) {
    super(props)

    this.state = {
      currentBlockNumberSearch: '',
      currentBlockSearchMatch: null,
      isSearchingForBlock: false,
      blockSearchMatch: false,
      validBlockSearchResult: false
    }
  }

  componentDidMount () {
    if (!this.state.isSearchingForBlock && this.props.params.block_number) {
      this._handleBlockNumberSearch(this.props.params.block_number)
    } else {
      this.setState({
        isSearchingForBlock: false,
        blockSearchMatch: false,
        validBlockSearchResult: false
      })
    }
  }

  componentWillReceiveProps (nextProps, nextState) {
    if (!this.state.isSearchingForBlock && nextProps.params.block_number) {
      this.setState({isSearchingForBlock: true}, () => {
        this._handleBlockNumberSearch(nextProps.params.block_number)
      })
    }

    if (nextProps.testRpcState.currentBlockSearchMatch !== null && nextProps.testRpcState.currentBlockSearchMatch !== this.props.testRpcState.currentBlockSearchMatch) {
      this.setState({
        currentBlockSearchMatch: nextProps.testRpcState.currentBlockSearchMatch,
        isSearchingForBlock: false,
        blockSearchMatch: true,
        validBlockSearchResult: nextProps.testRpcState.currentBlockSearchMatch && !nextProps.testRpcState.currentBlockSearchMatch.hasOwnProperty('error')
      })
    } else {
      this.setState({
        isSearchingForBlock: false,
        blockSearchMatch: false,
        validBlockSearchResult: false
      })
    }
  }

  _handleBlockNumberSearch = (value) => {
    this.setState({isSearchingForBlock: true}, () => {
      this.props.appSearchBlock(value)
    })
  }

  _handleBlockNumberSearchChange = (value) => {
    this.setState({currentBlockNumberSearch: value})
  }

  _handleClearBlockSearch = (e) => {
    e.preventDefault()
    this.setState({blockSearchMatch: false, currentBlockNumberSearch: '', currentBlockSearchMatch: null, validBlockSearchResult: false})
  }

  _handleTxSearch = (value) => {
    console.log(`SEARCHING FOR ${value}`)
    this.setState({isSearchingForTx: true})
    this.props.appSearchTx(value)
  }

  _renderBlockCard = (block) => {
    return (
      <BlockCard
        block={block}
        handleTxSearch={this._handleTxSearch}
      />
    )
  }

  _renderSearchingBlock = () => {
    return (
      <section>
        Searching for Block {this.state.currentBlockNumberSearch}
      </section>
    )
  }

  _renderBlockSearchMatch = () => {
    const block = this.state.currentBlockSearchMatch
    return this.state.currentBlockSearchMatch && this._renderBlockCard(block)
  }

  _renderPanelHeaderText = () => {
    if (this.state.validBlockSearchResult) {
      return `Showing Block #${EtherUtil.bufferToInt(this.state.currentBlockSearchMatch.header.number)}`
    }

    return `LAST ${this.props.blocks.length} BLOCKS`
  }

  _renderPanelHeaderControls = () => {
    if (this.state.validBlockSearchResult) {
      return (
        <a href="#" className={BlocksStyles.BackButton} onClick={this._handleClearBlockSearch}>&larr; All Blocks</a>
      )
    }
  }

  _renderPanelBody = () => {
    if (!this.state.isSearchingForBlock && !this.state.blockSearchMatch) {
      return <BlockList
              blocks={this.props.blocks}
              handleBlockNumberSearch={this._handleBlockNumberSearch}
              handleTxSearch={this.props.handleTxSearch}
            />
    }

    if (this.state.isSearchingForBlock) {
      return this._renderSearchingBlock()
    }

    if (this.state.validBlockSearchResult) {
      return this._renderBlockSearchMatch()
    }

    return this.state.currentBlockSearchMatch.error
  }

  render () {
    return (
      <div className={Styles.Blocks}>
        <h4>
          <span><Icon name="blocks" size={24} /> { this._renderPanelHeaderText() }</span>
          { this._renderPanelHeaderControls() }
        </h4>
        <main>
          { this._renderPanelBody() }
        </main>
      </div>
    )
  }
}
