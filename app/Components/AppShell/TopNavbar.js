import React, { Component } from 'react'
import { Link, hashHistory } from 'react-router'
import connect from '../Helpers/connect'
import * as Search from '../../Actions/Search'
import { setSystemError } from '../../Actions/Core'
 
import Spinner from '../../Elements/Spinner'
import OnlyIf from '../../Elements/OnlyIf'
import StatusIndicator from '../../Elements/StatusIndicator'
import Icon from '../../Elements/Icon'

import AccountIcon from '../../Elements/icons/account.svg'
import BlockIcon from '../../Elements/icons/blocks.svg'
import TxIcon from '../../Elements/icons/transactions.svg'
import LogsIcon from '../../Elements/icons/console.svg'
import SettingsIcon from '../../Elements/icons/settings.svg'
import SearchIcon from '../../Elements/icons/search.svg'
import ForceMineIcon from '../../Elements/icons/force_mine.svg'
import SnapshotIcon from '../../Elements/icons/snapshot.svg'
import StartMiningIcon from '../../Elements/icons/start.svg'
import StopMiningIcon from '../../Elements/icons/stop.svg'
import RevertIcon from '../../Elements/icons/revert.svg'

import Styles from './TopNavbar.css'

class TopNavbar extends Component {
  constructor (props) {
    super(props)

    this.searchInput = null
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
    this.props.appRevertSnapshot(this.props.core.snapshots.length)
  }

  handleSearchKeyPress = e => {
    if (e.key === 'Enter') {
      let value = this.searchInput.value.trim()

      // Secret to show the error screen when we need it.
      if (value.toLowerCase() == "error") {
        this.props.dispatch(setSystemError(new Error("You found a secret!")))
      } else {
        this.props.dispatch(Search.query(value))
      }
    }
  }

  _renderSnapshotControls = () => {
    const { snapshots } = this.props.core
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
    if (this.props.settings.server.blocktime) {
      return `${this.props.settings.server.blocktime} SEC block time`
    } else {
      return 'Automining'
    }
  }

  _renderMiningButtonText = () => {
    if (this.props.settings.server.blocktime) {
      return `MINING`
    } else {
      return 'AUTOMINING'
    }
  }

  _renderMiningControls = () => {
    return this.props.core.isMining
      ? <button
          className={Styles.MiningBtn}
          disabled={!this.props.core.isMining}
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
          disabled={this.props.core.isMining}
          onClick={this._handleStartMining}
        >
          <Icon glyph={StartMiningIcon} size={18} /> Start{' '}
          {this._renderMiningButtonText()}
        </button>
  }

  render () {
    const blockNumber = this.props.core.latestBlock
    const gasPrice = this.props.core.gasPrice
    const gasLimit = this.props.core.gasLimit
    const snapshots = this.props.core.snapshots
    const isMining = this.props.core.isMining

    const miningPaused = !isMining
    const currentSnapshotId = snapshots.length
    const showControls = false

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
            <Link to="logs" activeClassName={Styles.Active}>
              <Icon glyph={LogsIcon} size={44} />
              Logs
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
              value={gasLimit}
            />
            <StatusIndicator
              title="NETWORK ID"
              value={this.props.settings.server.network_id}
            />
            <StatusIndicator
              title="RPC SERVER"
              value={`http://${this.props.settings.server.hostname}:${this.props
                .settings.server.port}`}
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
                showControls
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
          </div>
        </section>
      </nav>
    )
  }
}

export default connect(TopNavbar)
