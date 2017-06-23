
import React, { Component } from 'react'

import BlockCard from './BlockCard'
import BlockList from './BlockList'
import InputText from 'Elements/InputText'
import EtherUtil from 'ethereumjs-util'
import Styles from './RecentBlocks.css'
import BlockExplorerStyles from '../BlockExplorer.css'

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

  componentWillReceiveProps (nextProps, nextState) {
    if (nextProps.testRpcState.currentBlockSearchMatch !== null && nextProps.testRpcState.currentBlockSearchMatch !== this.props.testRpcState.currentBlockSearchMatch) {
      this.setState({
        currentBlockSearchMatch: nextProps.testRpcState.currentBlockSearchMatch,
        isSearchingForBlock: false,
        blockSearchMatch: true,
        validBlockSearchResult: nextProps.testRpcState.currentBlockSearchMatch && !nextProps.testRpcState.currentBlockSearchMatch.hasOwnProperty('error')
      })
    }
  }

  _handleBlockNumberSearch = (value) => {
    this.setState({isSearchingForBlock: true})
    this.props.appSearchBlock(value)
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

    return `LAST 5 BLOCKS`
  }

  _renderPanelHeaderControls = () => {
    if (this.state.validBlockSearchResult) {
      return (
        <section className={Styles.DismissSearchResult}>
          <a href="#" className={BlockExplorerStyles.BackButton} onClick={this._handleClearBlockSearch}>&larr; All Blocks</a>
        </section>
      )
    }

    return (
      <InputText
        className={Styles.BlockSearchInput}
        placeholder={'Search for Block Number'}
        delay={0}
        value={this.state.currentBlockNumberSearch}
        onEnter={this._handleBlockNumberSearch}
        onChange={this._handleBlockNumberSearchChange}
      />
    )
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
          { this._renderPanelHeaderText() }
        </h4>
        <header>
          { this._renderPanelHeaderControls() }
        </header>
        <main>
          { this._renderPanelBody() }
        </main>
        <footer>
        </footer>
      </div>
    )
  }
}
