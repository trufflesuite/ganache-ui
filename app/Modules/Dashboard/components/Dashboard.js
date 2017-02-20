import React, {Component} from 'react'

import LogContainer from './LogContainer'

import WithEmptyState from 'Elements/WithEmptyState'
import Spinner from 'Elements/Spinner'

import Styles from './Dashboard.css'

class AccountList extends Component {
  render () {
    return <table className={Styles.AccountList}>
      <thead>
        <tr>
          <td>Accounts</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        {
          this.props.accounts.sort((a, b) => { return a.index > b.index }).map((account) => {
            return (
              <tr key={account.address}>
                <td>{ account.isUnlocked ? '🔓' : '🔐' }</td>
                <td>
                  <table>
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td className={Styles.RowHeader}>
                          INDEX
                        </td>
                        <td>{account.index}</td>
                      </tr>
                      <tr>
                        <td className={Styles.RowHeader}>
                          ADDRESS
                        </td>
                        <td>{account.address}</td>
                      </tr>
                      <tr>
                        <td className={Styles.RowHeader}>
                          PRIVATE KEY
                        </td>
                        <td>0x{account.privateKey}</td>
                      </tr>
                      <tr>
                        <td className={Styles.RowHeader}>
                          BALANCE
                        </td>
                        <td>{account.balance} WEI</td>
                      </tr>
                      <tr>
                        <td className={Styles.RowHeader}>
                          NONCE
                        </td>
                        <td>{account.nonce}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
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
    this.props.appRevertSnapshot()
  }

  render () {
    return (
      <div className={Styles.Dashboard}>
        <div className={Styles.MainContainer}>
          <div className={Styles.LeftSplit}>
            <WithEmptyState test={this.props.testRpcState.accounts.length === 0} emptyStateComponent={LoadingAccounts}>
              <AccountList
                accounts={this.props.testRpcState.accounts}
                />
            </WithEmptyState>
          </div>
          <div className={Styles.RightSplit}>
            <div className={Styles.Controls}>
              <section>
                <h4>MINING CONTROLS</h4>
                <button className={Styles.StopMiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}>Stop Mining</button>
                <button className={Styles.StartMiningBtn} disabled={this.props.testRpcState.isMining} onClick={this._handleStartMining}>Start Mining</button>
                <button className={Styles.StartMiningBtn} onClick={this._handleForceMine}>Force Mine</button>
                <button className={Styles.StartMiningBtn}>Increase Time</button>
              </section>
            </div>
            <div className={Styles.Controls}>
              <section>
                <h4>SNAPSHOT CONTROLS</h4>
                <button className={Styles.StopMiningBtn} onClick={this._handleMakeSnapshot}>Create Snapshot</button>
                <button className={Styles.StartMiningBtn} onClick={this._handleRevertSnapshot}>Revert Snapshot</button>
              </section>
            </div>
            <div className={Styles.Logs}>
              <h4>TESTRPC LOG</h4>
              <LogContainer
                logs={this.props.testRpcState.logs}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard
