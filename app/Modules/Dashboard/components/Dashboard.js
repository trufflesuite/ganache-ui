import React, {Component} from 'react'

import MnemonicAndHdPath from 'Elements/MnemonicAndHdPath'
import LogContainer from './LogContainer'
import AccountList from './AccountList'

import WithEmptyState from 'Elements/WithEmptyState'
import Spinner from 'Elements/Spinner'

import Styles from './Dashboard.css'

class LoadingAccounts extends Component {
  render () {
    return (
      <Spinner width={40} height={40}/>
    )
  }
}

class Dashboard extends Component {
  componentDidMount () {
    this.props.appGetBlockChainState()
  }

  _handleMakeSnapshot = (e) => {
    this.props.appMakeSnapshot()
  }

  _handleRevertSnapshot = (e) => {
    this.props.appRevertSnapshot()
  }

  render () {
    return (
      <div className={Styles.Dashboard}>
        <div className={Styles.Accounts}>
          <h4>ACCOUNTS ({this.props.testRpcState.accounts.length})</h4>
          <header>
            <MnemonicAndHdPath
              mnemonic={this.props.testRpcState.mnemonic}
              hdPath={this.props.testRpcState.hdPath}
            />
          </header>
          <main>
            <WithEmptyState
              test={this.props.testRpcState.accounts.length === 0}
              emptyStateComponent={LoadingAccounts}
              >
              <AccountList
                accounts={this.props.testRpcState.accounts}
              />
            </WithEmptyState>
          </main>
          <footer>
            <button className={Styles.MiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}>Add Account</button>
          </footer>
        </div>
        <div className={Styles.Logs}>
          <h4>TESTRPC LOG</h4>
          <main>
            <LogContainer
              logs={this.props.testRpcState.logs}
            />
          </main>
          <footer>
            <button className={Styles.MiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}>Save Logs</button>
            <button className={Styles.MiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}>Copy Logs</button>
            <button className={Styles.MiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}>Clear Logs</button>
          </footer>
        </div>
      </div>
    )
  }
}

export default Dashboard
