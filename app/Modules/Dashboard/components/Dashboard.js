import React, {Component} from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import MnemonicAndHdPath from './MnemonicAndHdPath'

import Styles from './Dashboard.css'

class Dashboard extends Component {
  render () {
    return (
      <div className={Styles.Dashboard}>

        <div className={Styles.MainContainer}>
          <div className={Styles.LeftSplit}>
            <table className={Styles.AccountList}>
              <thead>
                <tr>
                  <td>INDEX</td>
                  <td>STATUS</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {this._renderAccountList()}
              </tbody>
            </table>
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

  _renderAccountList = () => {
    return this.props.testRpcState.accounts.sort((a, b) => { return a.index > b.index }).map((account) => {
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
}

export default TestRPCProvider(Dashboard)
