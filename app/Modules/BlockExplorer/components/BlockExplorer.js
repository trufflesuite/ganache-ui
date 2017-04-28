import React, { Component } from 'react'
import EtherUtil from 'ethereumjs-util'

import EmptyTransactions from './EmptyTransactions'
import MiniBlockCard from './MiniBlockCard'
import MiniTxCard from './MiniTxCard'

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
              &larr; <a href="#" onClick={this._handleClearBlockSearch}>Go back to All Blocks</a>
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
                { !this.state.isSearchingForBlock && !this.state.blockSearchMatch
                  ? this._renderBlocks()
                  : this.state.currentBlockSearchMatch === null
                  ? this._renderSearchingBlock()
                  : this._renderBlockSearchMatch()
                }
              </tbody>
            </table>
          </main>
          <footer>
          </footer>
        </div>
        <div className={Styles.Transactions}>
          <h4>
            { this.state.currentTxSearchMatch
            ? `SHOWING TX ${this.state.currentTxSearchMatch.tx.hash}`
            : `LAST 5 TRANSACTIONS`
            }
          </h4>
          <header>
          { this.state.currentTxSearchMatch
            ? <section className={Styles.DismissSearchResult}>
              &larr; <a href="#" onClick={this._handleClearTxSearch}>Go back to All TXs</a>
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
              <table className={Styles.TransactionList}>
                <thead>
                  <tr>
                    <td>TX HASH</td>
                    <td>FROM</td>
                    <td>TO</td>
                    <td>NONCE</td>
                    <td>VALUE</td>
                  </tr>
                </thead>
                <tbody>
                  { !this.state.isSearchingForTx && !this.state.txSearchMatch
                    ? this._renderTransactions()
                    : this.state.currentTxSearchMatch === null
                    ? this._renderSearchingTx()
                    : this._renderTxSearchMatch()
                  }
                </tbody>
              </table>
            </WithEmptyState>
          </main>
          <footer>
          </footer>
        </div>
      </div>
    )
  }

  _handleBlockNumberSearch = (value) => {
    this.setState({isSearchingForBlock: true})
    this.props.appSearchBlock(value)
  }

  _handleBlockNumberSearchChange = (value) => {
    this.setState({currentBlockNumberSearch: value})
  }

  _handleTxSearch = (value) => {
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

  _handleTxShow = (txHash, e) => {
    console.log(e, txHash)
    e.preventDefault()
    this._handleTxSearch(txHash)
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
    return this.state.currentTxSearchMatch && this._renderTransactionCard(tx.tx)
  }

  _renderTransactionCard = (tx) => {
    return (
      <MiniTxCard
        className={Styles.Transaction}
        key={tx.hash}
        tx={tx}
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

  _renderBlockCard = (block) => {
    return (
      <MiniBlockCard
        block={block}
        key={block.hash}
        showBlockDetail={this._handleBlockNumberSearch}
      />
    )
  }

  _renderBlocks = () => {
    return this.props.testRpcState.blocks.map(this._renderBlockCard)
  }
}
