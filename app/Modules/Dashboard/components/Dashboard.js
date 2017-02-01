import React, {Component} from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import MnemonicAndHdPath from './MnemonicAndHdPath'

import Styles from './Dashboard.css'

class Dashboard extends Component {
  render () {
    return (
      <div className={Styles.Dashboard}>
        <MnemonicAndHdPath
          mnemonic={this.props.testRpcState.mnemonic}
          hdPath={this.props.testRpcState.hdPath}
          />
        <div className={Styles.MainContainer}>
          <div className={Styles.LeftSplit}>
            <div className={Styles.AccountList}>
              <ol>
                {this._renderAccountList()}
              </ol>
            </div>
          </div>
          <div className={Styles.RightSplit}>
            <div className={Styles.Controls}>

            </div>
            <div className={Styles.Log}>
              <textarea value={this.props.testRpcState.logs.join('\n')}>
              </textarea>
            </div>
          </div>
        </div>
      </div>
    )
  }

  _renderAccountList = () => {
    return this.props.testRpcState.accounts.sort((a, b) => { return a.index > b.index }).map((account) => {
      return (
        <li key={account.address} className={Styles.AccountDetails}>
          <header>
            <span className={Styles.AccountIndex}>{account.index}</span><span className={Styles.Address}>{account.address}</span>
          </header>
          <main>
            <div>{account.balance}</div>
            <div>{account.nonce}</div>
          </main>
          <div>{account.isUnlocked}</div>
          <div>{account.privateKey}</div>
        </li>
      )
    })
  }
}

export default TestRPCProvider(Dashboard)
