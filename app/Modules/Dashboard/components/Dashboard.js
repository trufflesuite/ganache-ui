import React, {Component} from 'react'

import WithEmptyState from 'Elements/WithEmptyState'
import Spinner from 'Elements/Spinner'

import Styles from './Dashboard.css'

class AccountList extends Component {
  render () {
    return <table className={Styles.AccountList}>
      <thead>
        <tr>
          <td>INDEX</td>
          <td>STATUS</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        {
          this.props.accounts.sort((a, b) => { return a.index > b.index }).map((account) => {
            return (
              <tr key={account.address}>
                <td>{account.index}</td>
                <td>{ account.isUnlocked ? '🔓' : '🔐' }</td>
                <td>
                  <table>
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td className={Styles.RowHeader}>
                          ADDRESS
                        </td>
                        <td>{account.address}</td>
                      </tr>
                      <tr>
                        <td className={Styles.RowHeader}>
                          PRIV. KEY
                        </td>
                        <td>{account.privateKey}</td>
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
                <button className={Styles.StopMiningBtn}>Stop Mining</button>
                <button className={Styles.StartMiningBtn}>Start Mining</button>
              </section>
            </div>
            <div className={Styles.Controls}>
              <section>
                <h4>SNAPSHOT CONTROLS</h4>
                <button className={Styles.StopMiningBtn}>Create Snapshot</button>
                <button className={Styles.StartMiningBtn}>Revert Snapshot</button>
                <button className={Styles.StartMiningBtn}>Increase Time</button>
                <button className={Styles.StartMiningBtn}>Force Mine</button>
              </section>
            </div>
            <div className={Styles.Log}>
              <h4>TESTRPC LOG</h4>
              <pre>
                {
                  this.props.testRpcState.logs.map((log) => {
                    return (
                      `[${new Date().toLocaleTimeString()}] ${log}\n`
                    )
                  })
                }
              </pre>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard
