import React, { Component } from 'react'
import { Link, hashHistory } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import Spinner from 'Elements/Spinner'
import OnlyIf from 'Elements/OnlyIf'
import StatusIndicator from 'Elements/StatusIndicator'
import Icon from 'Elements/Icon'

import AccountIcon from 'Icons/account.svg'
import BlockIcon from 'Icons/blocks.svg'
import TxIcon from 'Icons/transactions.svg'
import ConsoleIcon from 'Icons/console.svg'
import SettingsIcon from 'Icons/settings.svg'
import SearchIcon from 'Icons/search.svg'
import ForceMineIcon from 'Icons/force_mine.svg'
import SnapshotIcon from 'Icons/snapshot.svg'
import StartMiningIcon from 'Icons/start.svg'
import StopMiningIcon from 'Icons/stop.svg'
import RevertIcon from 'Icons/revert.svg'

import Styles from './TopNavbar.css'

class TopNavbar extends Component {
  constructor (props) {
    super(props)

    this.searchInput = null
  }

  componentDidMount () {
    this.props.appGetBlockChainState()
  }

  _handleStopMining = e => {
    this.props.appStopMining()
  }

  _handleStartMining = e => {
    this.props.appStartMining()
  }

  _handleForceMine = e => {
    this.props.appForceMine()
  }

  _handleMakeSnapshot = e => {
    this.props.appMakeSnapshot()
  }

  _handleRevertSnapshot = e => {
    this.props.appRevertSnapshot(this.props.testRpcState.snapshots.length)
  }

  classifyInput = () => {
    const searchTerm = this.searchInput.value

    switch (searchTerm) {
      case (searchTerm.match(/^(\d+)$/) || {}).input:
        hashHistory.push(`/blocks/${searchTerm}`)
        break
      case (searchTerm.match(/^[0(x|X)]*[a-zA-Z0-9]{40,42}$/) || {}).input:
        hashHistory.push(`/accounts/${searchTerm}`)
        break
      case (searchTerm.match(/^[0(x|X)]*[a-zA-Z0-9]{64,66}$/) || {}).input:
        hashHistory.push(`/transactions/${searchTerm}`)
        break
      default:
        break
    }

    this.searchInput.value = ''
  }

  handleSearchKeyPress = e => {
    if (e.key === 'Enter') {
      this.classifyInput()
    }
  }

  _renderSnapshotControls = () => {
    const { snapshots } = this.props.testRpcState
    const currentSnapshotId = snapshots.length
    const hasSnapshots = currentSnapshotId > 0
    const firstSnapshot = currentSnapshotId === 1

    return hasSnapshots
      ? <button
          className={Styles.MiningBtn}
          onClick={this._handleRevertSnapshot}
          disabled={snapshots.length === 0}
        >
          <Icon glyph={RevertIcon} size={18} />
          {firstSnapshot
            ? `REVERT TO BASE`
            : `REVERT TO SNAPSHOT #${currentSnapshotId - 1}`}
        </button>
      : null
  }

  _renderMiningTime = () => {
    if (this.props.testRpcState.blocktime !== 'Automining') {
      return `${this.props.testRpcState.blocktime} SEC block time`
    } else {
      return 'Automining'
    }
  }

  _renderMiningButtonText = () => {
    if (this.props.testRpcState.blocktime !== 'Automining') {
      return `MINING`
    } else {
      return 'AUTOMINING'
    }
  }

  _renderMiningControls = () => {
    return this.props.testRpcState.isMining
      ? <button
          className={Styles.MiningBtn}
          disabled={!this.props.testRpcState.isMining}
          onClick={this._handleStopMining}
        >
          <Icon
            glyph={StopMiningIcon}
            size={18}
            className={Styles.StopMining}
          />{' '}
          Stop {this._renderMiningButtonText()}
        </button>
      : <button
          className={Styles.MiningBtn}
          disabled={this.props.testRpcState.isMining}
          onClick={this._handleStartMining}
        >
          <Icon glyph={StartMiningIcon} size={18} /> Start{' '}
          {this._renderMiningButtonText()}
        </button>
  }

  render () {
    const {
      isMining,
      blockNumber,
      blocktime,
      gasPrice,
      snapshots
    } = this.props.testRpcState
    const miningPaused = !isMining
    const currentSnapshotId = snapshots.length
    const showControls =
      miningPaused || this.props.testRpcState.blocktime === 'Automining'

    if (!this.props.testRpcState.testRpcServerRunning) {
      return <div />
    }

    return (
      <nav className={Styles.Nav}>
        <main className={Styles.Main}>
          <div className={Styles.Menu}>
            <Link to="accounts" activeClassName={Styles.Active}>
              <Icon glyph={AccountIcon} size={44} />
              Accounts
            </Link>
            <Link to="blocks" activeClassName={Styles.Active}>
              <Icon glyph={BlockIcon} size={44} />
              Blocks
            </Link>
            <Link to="transactions" activeClassName={Styles.Active}>
              <Icon glyph={TxIcon} size={44} />
              Transactions
            </Link>
            <Link to="console" activeClassName={Styles.Active}>
              <Icon glyph={ConsoleIcon} size={44} />
              Console
            </Link>
          </div>
          <div className={Styles.SearchBar}>
            <input
              type="text"
              placeholder="SEARCH FOR BLOCK NUMBERS OR TX HASHES"
              ref={input => {
                this.searchInput = input
              }}
              onKeyPress={this.handleSearchKeyPress}
            />
            <Icon glyph={SearchIcon} size={16} />
          </div>
          <div className={Styles.Menu}>
            <Link to="config" activeClassName={Styles.Active}>
              <Icon glyph={SettingsIcon} size={44} />
            </Link>
          </div>
        </main>
        <section className={Styles.StatusAndControls}>
          <div className={Styles.Status}>
            <StatusIndicator title="CURRENT BLOCK" value={blockNumber} />
            <StatusIndicator title="GAS PRICE" value={gasPrice} />
            <StatusIndicator
              title="GAS LIMIT"
              value={this.props.testRpcState.gasLimit}
            />
            <StatusIndicator
              title="NETWORK ID"
              value={this.props.testRpcState.networkId}
            />
            <StatusIndicator
              title="RPC SERVER"
              value={`http://${this.props.testRpcState.host}:${this.props
                .testRpcState.port}`}
            />
            <StatusIndicator
              title="MINING STATUS"
              value={miningPaused ? 'STOPPED' : this._renderMiningTime()}
            >
              <OnlyIf test={isMining}>
                <Spinner width={'30px'} height={'30px'} />
              </OnlyIf>
            </StatusIndicator>
          </div>
          <div className={Styles.Actions}>
            <OnlyIf
              test={
                showControls &&
                this.props.testRpcState.blocktime !== 'Automining'
              }
            >
              <button
                className={Styles.MiningBtn}
                onClick={this._handleForceMine}
              >
                <Icon glyph={ForceMineIcon} size={18} /> Force Mine
              </button>
            </OnlyIf>
            <OnlyIf test={showControls}>
              <button
                className={Styles.MiningBtn}
                onClick={this._handleMakeSnapshot}
              >
                <Icon glyph={SnapshotIcon} size={18} /> TAKE SNAPSHOT #{currentSnapshotId + 1}
              </button>
            </OnlyIf>
            <OnlyIf test={showControls}>
              {this._renderSnapshotControls()}
            </OnlyIf>
            <OnlyIf test={this.props.testRpcState.blocktime !== 'Automining'}>
              {this._renderMiningControls()}
            </OnlyIf>
          </div>
        </section>
      </nav>
    )
  }
}

export default TestRPCProvider(TopNavbar)
