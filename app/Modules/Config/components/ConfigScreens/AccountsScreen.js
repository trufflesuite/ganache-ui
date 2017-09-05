import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

import executeValidations from './Validator'

const VALIDATIONS = {
  totalAccounts: {
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
                name="totalAccounts"
                type="text"
                className={
                  this.state.totalAccountsValidationError &&
                  Styles.ValidationError
                }
                value={this.props.formState.totalAccounts}
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
          <h4>CREATE LOCKED ACCOUNTS</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="accountsLocked"
                  id="AccountsLocked"
                  checked={this.props.formState.accountsLocked}
                  onChange={this.props.handleInputChange}
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

export default SettingsProvider(TestRPCProvider(AccountsScreen))
