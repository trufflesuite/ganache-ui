import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

class AccountsScreen extends Component {
  render () {
    return (
      <div>
        <h2>ACCOUNT OPTIONS</h2>
        <section>
          <h4>TOTAL ACCOUNTS TO GENERATE</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                ref="totalAccounts"
                name="totalAccounts"
                type="text"
                defaultValue={this.props.formState.totalAccounts}
                onChange={this.props.handleInputChange}
              />
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
