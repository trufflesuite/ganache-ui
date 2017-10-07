import React, { Component } from 'react'

import CoreProvider from 'Providers/Core'

import MnemonicAndHdPath from './MnemonicAndHdPath'
import AccountList from './AccountList'

import WithEmptyState from 'Elements/WithEmptyState'
import Spinner from 'Elements/Spinner'

import Styles from './Accounts.css'

class LoadingAccounts extends Component {
  render () {
    return <Spinner width={40} height={40} />
  }
}

class Accounts extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  componentDidMount () {
    this.props.appGetBlockChainState()
  }

  _handleClearLogs = () => {
    this.props.appClearLogs()
  }

  render () {
    return (
      <div className={Styles.Accounts}>
        <main>
          <div className={Styles.Mnemonic}>
            <MnemonicAndHdPath
              mnemonic={this.props.testRpcState.mnemonic}
              hdPath={this.props.testRpcState.hdPath}
            />
          </div>
          <AccountList accounts={this.props.core.accounts} balances={this.props.core.accountBalances} nonces={this.props.core.accountNonces} />
        </main>
      </div>
    )
  }
}

export default Accounts
