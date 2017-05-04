import React, { Component } from 'react'
import EtherUtil from 'ethereumjs-util'

import EmptyTransactions from './EmptyTransactions'
import BlockList from './BlockList'
import BlockCard from './BlockCard'

import TxList from './TxList'
import TxCard from './TxCard'

import WithEmptyState from 'Elements/WithEmptyState'
import InputText from 'Elements/InputText'

import Styles from './BlockExplorer.css'

export default class BlockExplorer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      currentBlockNumberSearch: '',
      currentBlockSearchMatch: null,
      currentTxSearchMatch: null,
      currentTxSearch: '',
      isSearchingForBlock: false,
      isSearchingForTx: false,
      blockSearchMatch: false,
      txSearchMatch: false
    }
  }

  componentWillReceiveProps (nextProps, nextState) {
    if (nextProps.testRpcState.currentBlockSearchMatch !== null && nextProps.testRpcState.currentBlockSearchMatch !== this.props.testRpcState.currentBlockSearchMatch) {
      this.setState({
        currentBlockSearchMatch: nextProps.testRpcState.currentBlockSearchMatch,
        isSearchingForBlock: false,
        blockSearchMatch: true
      })
    }

    if (nextProps.testRpcState.currentTxSearchMatch !== null && nextProps.testRpcState.currentTxSearchMatch !== this.props.testRpcState.currentTxSearchMatch) {
      this.setState({
        currentTxSearchMatch: nextProps.testRpcState.currentTxSearchMatch,
        isSearchingForTx: false,
        txSearchMatch: true
      })
    }
  }

  render () {
    return (
      <div className={Styles.BlockExplorer}>
        <div className={Styles.Blocks}>
          <h4>
            { this.state.currentBlockSearchMatch
              ? `Showing Block #${EtherUtil.bufferToInt(this.state.currentBlockSearchMatch.header.number)}`
              : `LAST 5 BLOCKS`
            }
          </h4>
          <header>
          { this.state.currentBlockSearchMatch
            ? <section className={Styles.DismissSearchResult}>
               <a href="#" className={Styles.BackButton} onClick={this._handleClearBlockSearch}>&larr; All Blocks</a>
            </section>
          : <InputText
              className={Styles.BlockSearchInput}
              placeholder={'Search for Block Number'}
              delay={0}
              value={this.state.currentBlockNumberSearch}
              onEnter={this._handleBlockNumberSearch}
              onChange={this._handleBlockNumberSearchChange}
            />
          }
          </header>
          <main>
            {
              !this.state.isSearchingForBlock && !this.state.blockSearchMatch
              ? <BlockList
                  blocks={this.props.testRpcState.blocks}
                  handleBlockNumberSearch={this._handleBlockNumberSearch}
                  handleTxSearch={this._handleTxSearch}
                />
              : this.state.currentBlockSearchMatch === null
              ? this._renderSearchingBlock()
              : this._renderBlockSearchMatch()
            }
          </main>
          <footer>
          </footer>
        </div>
        <div className={Styles.Transactions}>
          <h4>
            { this.state.currentTxSearchMatch
            ? `SHOWING TX ${this.state.currentTxSearchMatch.hash}`
            : `LAST 5 TRANSACTIONS`
            }
          </h4>
          <header>
          { this.state.currentTxSearchMatch
            ? <section className={Styles.DismissSearchResult}>
                <a href="#" className={Styles.BackButton} onClick={this._handleClearTxSearch}>&larr; All TXs</a>
              </section>
            : <InputText
              className={Styles.TxSearchInput}
              placeholder={'Search for TX Hash'}
              delay={0}
              value={this.state.currentTxSearch}
              onEnter={this._handleTxSearch}
              onChange={this._handleTxSearchChange}
            />
          }
          </header>
          <main>
            <WithEmptyState
              test={this.props.testRpcState.transactions.length === 0}
              emptyStateComponent={EmptyTransactions}
            >
              { !this.state.isSearchingForTx && !this.state.txSearchMatch
                ? <TxList
                    transactions={this.props.testRpcState.transactions}
                    handleTxSearch={this._handleTxSearch}
                  />
                : this.state.currentTxSearchMatch === null
                ? this._renderSearchingTx()
                : this._renderTxSearchMatch()
              }
            </WithEmptyState>
          </main>
          <footer>
          </footer>
        </div>
      </div>
    )
  }

  _renderSearchingTx = () => {
    return (
      <section>
        Searching for Transaction {this.state.currentTxNumberSearch}
      </section>
    )
  }

  _renderTxSearchMatch = () => {
    const tx = this.state.currentTxSearchMatch
    console.log(tx)
    return this.state.currentTxSearchMatch && this._renderTransactionCard(tx)
  }

  _renderTransactionCard = (tx) => {
    return (
      <TxCard
        className={Styles.Transaction}
        key={tx.hash}
        tx={tx}
        handleTxSearch={this._handleTxSearch}
      />
    )
  }

  _renderBlockCard = (block) => {
    return (
      <BlockCard
        block={block}
        handleTxSearch={this._handleTxSearch}
      />
    )
  }

  _renderTransactions = () => {
    return this.props.testRpcState.transactions.map(this._renderTransactionCard)
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

  _handleBlockNumberSearch = (value) => {
    this.setState({isSearchingForBlock: true})
    this.props.appSearchBlock(value)
  }

  _handleBlockNumberSearchChange = (value) => {
    this.setState({currentBlockNumberSearch: value})
  }

  _handleTxSearch = (value) => {
    console.log(`SEARCHING FOR ${value}`)
    this.setState({isSearchingForTx: true})
    this.props.appSearchTx(value)
  }

  _handleTxSearchChange = (value) => {
    this.setState({currentTxSearch: value})
  }

  _handleClearBlockSearch = (e) => {
    e.preventDefault()
    this.setState({blockSearchMatch: false, currentBlockNumberSearch: '', currentBlockSearchMatch: null})
  }

  _handleClearTxSearch = (e) => {
    e.preventDefault()
    this.setState({txSearchMatch: false, currentTxNumberSearch: '', currentTxSearchMatch: null})
  }

}
