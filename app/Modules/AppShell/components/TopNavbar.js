import React from 'react'
import { Link } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import Spinner from 'Elements/Spinner'
import Icon from 'Elements/Icon'

import Styles from './TopNavbar.css'

class StatusIndicator extends React.PureComponent {
  render () {
    return (
      <div className={Styles.StatusIndicator}>
        <div className={Styles.Metric}>
          <h4>{this.props.title}</h4>
          <span>{this.props.value}</span>
        </div>
        {
          this.props.children ?
          <div className={Styles.Indicator}>
            {this.props.children}
          </div>
          : null
        }
      </div>
    )
  }
}

class TopNavbar extends React.PureComponent {

  componentDidMount () {
    this.props.appGetBlockChainState()
  }

  _handleStopMining = (e) => {
    this.props.appStopMining()
  }

  _handleStartMining = (e) => {
    this.props.appStartMining()
  }

  _handleForceMine = (e) => {
    this.props.appForceMine()
  }

  _handleMakeSnapshot = (e) => {
    this.props.appMakeSnapshot()
  }

  _handleRevertSnapshot = (e) => {
    this.props.appRevertSnapshot(this.props.testRpcState.snapshots.length)
  }

  _renderSnapshotControls = () => {
    const { snapshots } = this.props.testRpcState
    const currentSnapshotId = snapshots.length
    const hasSnapshots = currentSnapshotId > 0
    const firstSnapshot = currentSnapshotId === 1

    return (
      hasSnapshots
      ? <button className={Styles.MiningBtn}
          onClick={this._handleRevertSnapshot}
          disabled={snapshots.length === 0}
        >
          { firstSnapshot ? `REVERT TO BASE` : `REVERT TO SNAPSHOT #${currentSnapshotId - 1}` }
        </button>
      : null
    )
  }

  _renderMiningTime = () => {
    if (this.props.testRpcState.blocktime !== 'Automining') {
      return `${this.props.testRpcState.blocktime} (SEC)`
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

  render () {
    const { isMining, blockNumber, blocktime, gasPrice, snapshots } = this.props.testRpcState
    const miningPaused = !isMining
    const currentSnapshotId = snapshots.length

    if (!this.props.testRpcState.testRpcServerRunning) {
      return <div></div>
    }

    return (
      <nav className={Styles.Nav}>
        <main className={Styles.Main}>
          <div className={Styles.Menu}>
            <Link to="/dashboard" activeClassName={Styles.Active}>
              <Icon name="account" size={44} />
              Accounts
            </Link>
            <Link to="/block_explorer" activeClassName={Styles.Active}>
              <Icon name="blocks" size={44}/>
              Blocks
            </Link>
            <Link to="/block_explorer" activeClassName={Styles.Active}>
              <Icon name="transactions" size={44}/>
              Transactions
            </Link>
            <Link to="/repl" activeClassName={Styles.Active}>
              <Icon name="console" size={44}/>
              Console
            </Link>
            <Link to="/config" activeClassName={Styles.Active}>
              <Icon name="settings" size={44}/>
              Settings
            </Link>
          </div>
          <div className={Styles.SearchBar}>
            <input type="text" placeholder="" />
            <Icon name="search" size={16} />
          </div>
        </main>
        <footer className={Styles.Footer}>
          <div className={Styles.Status}>
            <StatusIndicator title="CURRENT BLOCK" value={blockNumber} />
            <StatusIndicator title="BLOCK INTERVAL TIME" value={this._renderMiningTime()} />
            <StatusIndicator title="GAS PRICE" value={gasPrice} />
            <StatusIndicator title="GAS LIMIT" value={this.props.testRpcState.gasLimit} />
            <StatusIndicator
              title="MINING STATUS"
              value={miningPaused ? 'STOPPED' : 'MINING'}
            >
            {miningPaused ? null : <Spinner width={'30px'} height={'30px'} />}
          </StatusIndicator>

          </div>
          <div className={Styles.Actions}>
            { miningPaused ? <button className={Styles.MiningBtn} onClick={this._handleForceMine}><Icon name="force_mine" size={22} /> Force Mine</button> : null }
            { miningPaused ? <button className={Styles.MiningBtn} onClick={this._handleMakeSnapshot}><Icon name="snapshot" size={22} /> TAKE SNAPSHOT #{currentSnapshotId + 1}</button> : null }
            { miningPaused ? this._renderSnapshotControls() : null }
            {
              this.props.testRpcState.isMining
              ?
              <button className={Styles.MiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}><Icon name="stop" size={18} /> Stop {this._renderMiningButtonText()}</button>
              :
              <button className={Styles.MiningBtn} disabled={this.props.testRpcState.isMining} onClick={this._handleStartMining}><Icon name="start" size={18} /> Start {this._renderMiningButtonText()}</button>
            }
          </div>
        </footer>
      </nav>
    )
  }

}

export default TestRPCProvider(TopNavbar)
