import React, { Component } from 'react'
import Pluralize from 'pluralize'

import BlockCard from './BlockCard'
import BlockList from './BlockList'

import EtherUtil from 'ethereumjs-util'

import { hashHistory } from 'react-router'

import Styles from './RecentBlocks.css'
import BlocksStyles from '../Blocks.css'

export default class RecentBlocks extends Component {
  constructor (props) {
    super(props)

    this.state = {
      currentBlockNumberSearch: null,
      currentBlockSearchMatch: null,
      isSearchingForBlock: false,
      blockSearchMatch: false,
      validBlockSearchResult: false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (
      nextProps.params.block_number === this.props.params.block_number &&
      this.props.params.block_number === this.state.currentBlockNumberSearch &&
      !this.state.isSearchingForBlock
    ) {
      return
    }

    if (
      nextProps.testRpcState.currentBlockSearchMatch !==
        this.state.currentBlockSearchMatch &&
      nextProps.params.block_number !== undefined
    ) {
      this.setState({
        isSearchingForBlock: false,
        blockSearchMatch: true,
        currentBlockNumberSearch: nextProps.params.block_number,
        currentBlockSearchMatch: nextProps.testRpcState.currentBlockSearchMatch,
        validBlockSearchResult:
          nextProps.testRpcState.currentBlockSearchMatch &&
          !nextProps.testRpcState.currentBlockSearchMatch.hasOwnProperty(
            'error'
          )
      })
    } else {
      this.setState({
        isSearchingForBlock: false,
        blockSearchMatch: false,
        validBlockSearchResult: false,
        currentBlockNumberSearch: null,
        currentBlockSearchMatch: null
      })
    }

    if (
      nextProps.params.block_number !== undefined &&
      nextProps.params.block_number !== this.state.currentBlockNumberSearch &&
      !this.state.isSearchingForBlock &&
      !this.state.validBlockSearchResult
    ) {
      this.setState(prevState => {
        return {
          ...prevState,
          isSearchingForBlock: true,
          currentBlockNumberSearch: nextProps.params.block_number,
          blockSearchMatch: false
        }
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isSearchingForBlock && !prevState.isSearchingForBlock) {
      this.props.appSearchBlock(this.props.params.block_number)
    }
  }

  _handleClearBlockSearch = e => {
    e.preventDefault()
    this.setState(() => {
      hashHistory.push(`/blocks`)
      return {
        blockSearchMatch: false,
        currentBlockNumberSearch: null,
        currentBlockSearchMatch: null,
        validBlockSearchResult: false,
        isSearchingForBlock: false
      }
    })
  }

  _handleTxSearch = value => {
    this.setState({ isSearchingForTx: true })
    this.props.appSearchTx(value)
  }

  _renderBlockCard = block => {
    return <BlockCard block={block} handleTxSearch={this._handleTxSearch} />
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
    return (
      this.state.currentBlockSearchMatch &&
      this.state.validBlockSearchResult &&
      this._renderBlockCard(block)
    )
  }

  _renderPanelHeaderText = () => {
    if (this.state.validBlockSearchResult) {
      return `BLOCK #${EtherUtil.bufferToInt(
        this.state.currentBlockSearchMatch.header.number
      )}`
    }

    return `LAST ${this.props.blocks.length} ${Pluralize(
      'BLOCKS',
      this.props.blocks.length
    )}`
  }

  _renderPanelHeaderControls = () => {}

  _renderPanelBody = () => {
    if (!this.state.isSearchingForBlock && !this.state.blockSearchMatch) {
      return (
        <BlockList
          blocks={this.props.blocks}
          handleBlockNumberSearch={this._handleBlockNumberSearch}
          handleTxSearch={this.props.handleTxSearch}
        />
      )
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
        {this.state.validBlockSearchResult
          ? <a
              href="#"
              className={BlocksStyles.BackButton}
              onClick={this._handleClearBlockSearch}
            >
              &larr; All Blocks
            </a>
          : null}
        <main>
          {this._renderPanelBody()}
        </main>
      </div>
    )
  }
}
