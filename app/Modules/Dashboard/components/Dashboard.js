import React, {Component} from 'react'

import Web3 from 'web3'

import MnemonicAndHdPath from 'Elements/MnemonicAndHdPath'
import LogContainer from 'Elements/LogContainer'
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
    this.props.appGetBlockChainState().then(() => {
      this.props.appServices.repl.setReplContextItem('accounts', this.props.testRpcState.accounts.length)
      this.props.appServices.repl.setReplContextItem('web3',
                                                      new Web3(new Web3.providers.HttpProvider(`http://${this.props.testRpcState.host}:${this.props.testRpcState.port}`)))
    })
  }

  nextAccountIndex = () => {
    return this.props.testRpcState.accounts.length + 1
  }

  _handleAddAccount = () => {
    this.props.appAddAccount({index: this.nextAccountIndex()})
  }

  _handleSaveLog = () => {

  }

  _handleCopyLogs = () => {

  }

  _handleClearLogs = () => {
    this.props.appClearLogs()
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
            <button className={Styles.MiningBtn} onClick={this._handleAddAccount}>Add Account</button>
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
            <button className={Styles.MiningBtn} onClick={this._handleSaveLog}>Save Logs</button>
            <button className={Styles.MiningBtn} onClick={this._handleCopyLogs}>Copy Logs</button>
            <button className={Styles.MiningBtn} onClick={this._handleClearLogs}>Clear Log</button>
          </footer>
        </div>
      </div>
    )
  }
}

export default Dashboard
