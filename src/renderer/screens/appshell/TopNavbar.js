import React, { Component } from 'react'
import { Link } from 'react-router'

import connect from '../helpers/connect'
import * as Search from '../../../common/redux/search/actions'
import { setSystemError } from '../../../common/redux/core/actions'
import { setUpdateAvailable } from '../../../common/redux/auto-update/actions'
import { closeWorkspace, saveWorkspace } from '../../../common/redux/workspaces/actions'
import { clearLogLines } from '../../../common/redux/logs/actions'
 
import Spinner from '../../components/spinner/Spinner'
import OnlyIf from '../../components/only-if/OnlyIf'
import StatusIndicator from '../../components/status-indicator/StatusIndicator'
import UpdateNotification from '../auto-update/UpdateNotification'

import AccountIcon from '../../icons/account.svg'
import BlockIcon from '../../icons/blocks.svg'
import TxIcon from '../../icons/transactions.svg'
import LogsIcon from '../../icons/console.svg'
import ContractsIcon from '../../icons/contract-icon.svg'
import EventsIcon from '../../icons/events-icon.svg'

import SettingsIcon from '../../icons/settings-icon.svg'
import SearchIcon from '../../icons/search.svg'
import ForceMineIcon from '../../icons/force_mine.svg'
import SnapshotIcon from '../../icons/snapshot.svg'
import RevertIcon from '../../icons/revert.svg'

class TopNavbar extends Component {
  constructor (props) {
    super(props)

    this.state = {
      searchInput: ""
    }
  }

  _handleStopMining(e) {
    this.props.appStopMining()
  }

  _handleStartMining(e) {
    this.props.appStartMining()
  }

  _handleForceMine(e) {
    this.props.appForceMine()
  }

  _handleMakeSnapshot(e) {
    this.props.appMakeSnapshot()
  }

  _handleRevertSnapshot(e) {
    this.props.appRevertSnapshot(this.props.core.snapshots.length)
  }

  _handleClearLogs(e) {
    this.props.dispatch(clearLogLines())
  }

  handleSearchChange(e) {
    this.setState({
      searchInput: e.target.value
    })
  }

  handleSearchKeyPress(e) {
    if (e.key === 'Enter') {
      let value = this.state.searchInput.trim()

      // Secret to show the error screen when we need it.
      if (value.toLowerCase() == "error") {
        this.props.dispatch(setSystemError(new Error("You found a secret!")))
      } else if (value.toLowerCase() == "test-update") {
        this.props.dispatch(setUpdateAvailable("9.9.9", "Release Name", "This is a release note.\n\n**bold** _italic_ or is this *italic*? [trufflesuite/ganache-cli#417](https://github.com/trufflesuite/ganache-cli/issues/417)\n\nDo we scroll to get here?\n\nHow about here?"))
      } else {
        this.props.dispatch(Search.query(value))
      }

      this.setState({
        searchInput: ""
      })
    }
  }

  handleWorkspacesPress(e) {
    this.props.dispatch(closeWorkspace())
  }

  handleSaveWorkspacePress(e) {
    this.props.dispatch(saveWorkspace(Date.now().toString()))
  }

  _renderSnapshotControls() {
    const { snapshots } = this.props.core
    const currentSnapshotId = snapshots.length
    const hasSnapshots = currentSnapshotId > 0
    const firstSnapshot = currentSnapshotId === 1

    return hasSnapshots
      ? <button
          className="MiningBtn"
          onClick={this._handleRevertSnapshot}
          disabled={snapshots.length === 0}
        >
          <RevertIcon /*size={18}*/ />
          {firstSnapshot
            ? `REVERT TO BASE`
            : `REVERT TO SNAPSHOT #${currentSnapshotId - 1}`}
        </button>
      : null
  }

  _renderMiningTime() {
    if (this.props.config.settings.workspace.server.blockTime) {
      return `${this.props.config.settings.workspace.server.blockTime} SEC block time`
    } else {
      return 'Automining'
    }
  }

  render () {
    const blockNumber = this.props.core.latestBlock
    const gasPrice = this.props.core.gasPrice
    const gasLimit = this.props.core.gasLimit
    const snapshots = this.props.core.snapshots
    const isMining = this.props.core.isMining
    const isLogsPage = this.props.location.pathname === '/logs'
    const isNewVersionAvailable = this.props.autoUpdate.isNewVersionAvailable
    const miningPaused = !isMining
    const currentSnapshotId = snapshots.length
    const showControls = false

    return (
      <nav className="TopNavBar">
        <main className="Main">
          <div className="Menu">
            <Link to="/accounts" activeClassName="Active">
              <AccountIcon />
              Accounts
            </Link>
            <Link to="/blocks" activeClassName="Active">
              <BlockIcon />
              Blocks
            </Link>
            <Link to="/transactions" activeClassName="Active">
              <TxIcon />
              Transactions
            </Link>
            <Link to="/logs" activeClassName="Active">
              <LogsIcon />
              Logs
            </Link>
            <Link to="/contracts" activeClassName="Active">
              <ContractsIcon />
              Contracts
            </Link>
            <Link to="/events" activeClassName="Active">
              <EventsIcon />
              Events
            </Link>
          </div>
          <div className="NotificationAndSearchBar">
            <OnlyIf test={isNewVersionAvailable}>
              <UpdateNotification />
            </OnlyIf>
            <input
              type="text"
              placeholder="SEARCH FOR BLOCK NUMBERS OR TX HASHES"
              value={this.state.searchInput}
              onChange={this.handleSearchChange.bind(this)}
              onKeyPress={this.handleSearchKeyPress.bind(this)}
            />
            <SearchIcon />
          </div>
        </main>
        <section className="StatusAndControls">
          <div className="Status">
            <StatusIndicator title="CURRENT BLOCK" value={blockNumber} />
            <StatusIndicator title="GAS PRICE" value={gasPrice} />
            <StatusIndicator
              title="GAS LIMIT"
              value={gasLimit}
            />
            <StatusIndicator
              title="NETWORK ID"
              value={this.props.config.settings.workspace.server.network_id}
            />
            <StatusIndicator
              title="RPC SERVER"
              value={`http://${this.props.config.settings.workspace.server.hostname}:${this.props.config.settings.workspace.server.port}`}
            />
            <StatusIndicator
              title="MINING STATUS"
              value={miningPaused ? 'STOPPED' : this._renderMiningTime()}
            >
              <OnlyIf test={isMining}>
                <Spinner />
              </OnlyIf>
            </StatusIndicator>
            <StatusIndicator
              title="WORKSPACE"
              value={this.props.config.settings.workspace.name}
            />
          </div>
          <div className="Actions">
            <Link onClick={this.handleSaveWorkspacePress.bind(this)}>
              <button>Save</button>
            </Link>
            <Link onClick={this.handleWorkspacesPress.bind(this)}>
              <button>Load</button>
            </Link>
            <Link to="/config">
              <button><div className="settingsIconWrapper"><SettingsIcon /></div></button>
            </Link>
            <OnlyIf test={isLogsPage}>
              <button onClick={this._handleClearLogs.bind(this)}>
                Clear Logs
              </button>
            </OnlyIf>
            <OnlyIf
              test={
                showControls
              }
            >
              <button
                className="MiningBtn"
                onClick={this._handleForceMine}
              >
                <ForceMineIcon /*size={18}*/ /> Force Mine
              </button>
            </OnlyIf>
            <OnlyIf test={showControls}>
              <button
                className="MiningBtn"
                onClick={this._handleMakeSnapshot}
              >
                <SnapshotIcon /*size={18}*/ /> TAKE SNAPSHOT #{currentSnapshotId + 1}
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
