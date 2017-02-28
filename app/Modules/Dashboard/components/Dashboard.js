import React, {Component} from 'react'

import MnemonicAndHdPath from 'Elements/MnemonicAndHdPath'
import LogContainer from './LogContainer'

import WithEmptyState from 'Elements/WithEmptyState'
import Spinner from 'Elements/Spinner'

import Styles from './Dashboard.css'

class AccountList extends Component {
  render () {
    return <table className={Styles.AccountList}>
      <thead>
        <tr>
          <td>INDEX</td>
          <td>ADDRESS</td>
          <td>PRIVATE KEY</td>
          <td>BALANCE (WEI)</td>
          <td>NONCE</td>
          <td>STATE</td>
        </tr>
      </thead>
      <tbody>
        {
          this.props.accounts.sort((a, b) => { return a.index > b.index }).map((account) => {
            return (
              <tr key={account.address}>
                <td>{account.index}</td>
                <td>{account.address}</td>
                <td>0x{account.privateKey}</td>
                <td>{account.balance} WEI</td>
                <td>{account.nonce}</td>
                <td>{ account.isUnlocked ? '🔓' : '🔐' }</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  }
}

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
          <MnemonicAndHdPath
            mnemonic={this.props.testRpcState.mnemonic}
            hdPath={this.props.testRpcState.hdPath}
          />
          <WithEmptyState test={this.props.testRpcState.accounts.length === 0} emptyStateComponent={LoadingAccounts}>
            <AccountList
              accounts={this.props.testRpcState.accounts}
            />
          </WithEmptyState>
        </div>
        <div className={Styles.Logs}>
          <h4>TESTRPC LOG</h4>
          <LogContainer
            logs={this.props.testRpcState.logs}
          />
        </div>
      </div>
    )
  }
}

export default Dashboard
