import React from 'react'
import { Link } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import Spinner from 'Elements/Spinner'

import Styles from './TopNavbar.css'

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
              <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1 1)" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke-linecap="round" stroke-linejoin="round"><path d="M30.182 26.545c-1.722-.192-4.463-.91-8.182-.91-3.72 0-6.46.718-8.182.91-1.072.836-1.818 1.93-1.818 2.728v3.636h20v-3.637c0-.798-.746-1.892-1.818-2.728zM17.455 18.364v-1.82c0-2.407 2.238-4.544 5.454-4.544 2.306 0 4.545 2.137 4.545 4.545v1.82c0 2.407-2.24 4.544-4.546 4.544-3.217 0-5.455-2.138-5.455-4.546z"/></g><circle cx="22" cy="22" r="22"/></g></svg>
              Accounts
            </Link>
            <Link to="/block_explorer" activeClassName={Styles.Active}>
              <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1 1)" stroke-width="2" fill="none" fill-rule="evenodd"><path d="M13 13h7.13v7.13H13zM24.87 13H32v7.13h-7.13zM24.87 24.87V32H32v-7.13h-7.13zM13 24.87V32h7.13v-7.13H13z"/><circle cx="22" cy="22" r="22"/></g></svg>
              Blocks
            </Link>
            <Link to="/block_explorer" activeClassName={Styles.Active}>
              <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1 1)" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke-linecap="round" stroke-linejoin="round"><path d="M20.37 17.667h12.778M27.82 24.97l5.393-7.342-5.393-7.34"/><g><path d="M24.63 26.185H11.852M16.728 18.662l-5.393 7.34 5.393 7.34"/></g></g><circle cx="22" cy="22" r="22"/></g></svg>
              Transactions
            </Link>
            <Link to="/repl" activeClassName={Styles.Active}>
              <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1 1)" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke-linecap="round" stroke-linejoin="round"><path d="M15.316 22.894l3.08 2.54-3.08 2.54M19.5 27.783h4.105"/><path d="M12.237 31.335h20.526V15.313H12.237zM12.75 19.565h19.712M16.565 15.743v2.953"/></g><circle cx="22" cy="22" r="22"/></g></svg>
              Console
            </Link>
            <Link to="/config" activeClassName={Styles.Active}>
              <svg width="46" height="46" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1 1)" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke-linecap="round" stroke-linejoin="round"><path d="M22.423 20c1.338 0 2.423 1.053 2.423 2.353 0 1.3-1.085 2.352-2.423 2.352S20 23.652 20 22.353c0-1.3 1.085-2.353 2.423-2.353z"/><path d="M33 24.233v-4.078h-3.08c-.14-.543-.42-1.087-.7-1.63l2.17-2.107-2.94-2.855-2.17 2.107c-.49-.272-1.05-.476-1.68-.68V12h-4.2v2.99c-.56.136-1.12.408-1.68.68l-2.17-2.107-2.94 2.854 2.17 2.107c-.28.476-.49 1.02-.7 1.63H12v4.08h3.08c.14.543.42 1.086.7 1.63l-2.17 2.107 2.94 2.855 2.17-2.106c.49.27 1.05.474 1.68.678v2.99h4.2v-2.99c.56-.136 1.12-.408 1.68-.68l2.17 2.107 2.94-2.854-2.17-2.106c.28-.476.49-1.02.7-1.63H33z"/></g><circle cx="22" cy="22" r="22"/></g></svg>
              Settings
            </Link>
          </div>
          <div className={Styles.SearchBar}>
            <input type="text" placeholder="" />
            <svg width="18" height="17" viewBox="0 0 18 17" xmlns="http://www.w3.org/2000/svg"><g stroke="#848485" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M17 16l-5-4M7 1c3.313 0 6 2.687 6 6s-2.687 6-6 6-6-2.687-6-6 2.687-6 6-6z"/></g></svg>
          </div>
        </main>
        <footer className={Styles.Footer}>
          <div>
            <h4>CURRENT BLOCK NUMBER</h4>
            <span>{blockNumber}</span>
          </div>
          <div>
            <h4>BLOCK INTERVAL TIME</h4>
            <span>{this._renderMiningTime()}</span>
          </div>
          <div>
            <h4>GAS PRICE / LIMIT</h4>
            <span>{gasPrice} / {this.props.testRpcState.gasLimit}</span>
          </div>
          <div>
            <h4>MINING CONTROLS</h4>
            {
              this.props.testRpcState.isMining
              ?
                <button className={Styles.MiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}>Stop {this._renderMiningButtonText()}</button>
              :
                <button className={Styles.MiningBtn} disabled={this.props.testRpcState.isMining} onClick={this._handleStartMining}>Start {this._renderMiningButtonText()}</button>
            }
            { miningPaused ? <button className={Styles.MiningBtn} onClick={this._handleForceMine}>Force Mine</button> : null }
            { miningPaused ? <button className={Styles.MiningBtn} onClick={this._handleMakeSnapshot}>TAKE SNAPSHOT #{currentSnapshotId + 1}</button> : null }
            { miningPaused ? this._renderSnapshotControls() : null }
            { !miningPaused
              ? <div className={Styles.MiningStatus}><Spinner width={'30px'} height={'30px'} /><span>Mining</span></div>
              : null
            }
          </div>
        </footer>
      </nav>
    )
  }

}

export default TestRPCProvider(TopNavbar)
