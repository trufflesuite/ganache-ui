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
              <section>
                <h4>MINING CONTROLS</h4>
                <button className={Styles.StopMiningBtn}>Stop Mining</button>
                <button className={Styles.StartMiningBtn}>Start Mining</button>
              </section>
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
            <span className={Styles.AccountIndex}>{account.index}</span>
            <span className={Styles.Address}>{account.address}</span>
            <span className={Styles.LockStatus}>
              { account.isUnlocked ? '🔓' : '🔐' }
            </span>
          </header>
          <main>
            <div>
              <dl>
                <dt>BALANCE</dt>
                <dd>{account.balance} WEI</dd>
              </dl>
            </div>
            <div>
              <dl>
                <dt>NONCE</dt>
                <dd>{account.nonce}</dd>
              </dl>
            </div>
            <div>
              <dl>
                <dt>PRIVATE KEY</dt>
                <dd>{account.privateKey}</dd>
              </dl>
            </div>
          </main>
        </li>
      )
    })
  }
}

export default TestRPCProvider(Dashboard)
