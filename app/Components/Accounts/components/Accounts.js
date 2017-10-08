import React, { Component } from 'react'

import connect from 'Components/Helpers/connect'

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

  _handleClearLogs = () => {
    this.props.appClearLogs()
  }

  render () {
    return (
      <div className={Styles.Accounts}>
        <main>
          <div className={Styles.Mnemonic}>
            <MnemonicAndHdPath
              mnemonic={this.props.core.mnemonic}
              hdPath={this.props.core.hdPath}
            />
          </div>
          <AccountList accounts={this.props.accounts.addresses} balances={this.props.accounts.balances} nonces={this.props.accounts.nonces} />
        </main>
      </div>
    )
  }
}

export default connect(Accounts, "core", "accounts")
