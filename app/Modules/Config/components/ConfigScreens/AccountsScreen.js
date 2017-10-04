import React, { Component } from 'react'

import Styles from '../ConfigScreen.css'

import executeValidations from './Validator'

const VALIDATIONS = {
  "server.total_accounts": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 100
  }
}

class AccountsScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      totalAccountsValidationError: false
    }
  }

  validateChange = e => {
    executeValidations(VALIDATIONS, this, e)
      ? this.props.onNotifyValidationsPassed(e.target.name)
      : this.props.onNotifyValidationError(e.target.name)
  }

  toggleAccountsLocked = () => {
    this.setState({
      accountsLocked: !this.state.accountsLocked
    })
  }

  render () {
    return (
      <div>
        <h2>ACCOUNT OPTIONS</h2>
        <section>
          <h4>TOTAL ACCOUNTS TO GENERATE</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                name="server.total_accounts"
                type="text"
                className={
                  this.state.totalAccountsValidationError &&
                  Styles.ValidationError
                }
                value={this.props.settings.server.total_accounts}
                onChange={this.validateChange}
              />
              {this.state.totalAccountsValidationError &&
                <p>The number of accounts must be &gt; 1 and &lt; 100</p>}
            </div>
            <div className={Styles.RowItem}>
              <p>Total number of Accounts to create and pre-fund.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>LOCK ACCOUNTS</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="accountsLocked"
                  id="AccountsLocked"
                  checked={this.state.accountsLocked}
                  onChange={this.toggleAccountsLocked}
                />
                <label htmlFor="AccountsLocked">ACCOUNTS LOCKED</label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>Create accounts that are locked by default.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default AccountsScreen
