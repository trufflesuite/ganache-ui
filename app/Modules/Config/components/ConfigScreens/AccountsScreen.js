import React, { Component } from 'react'

import Styles from '../ConfigScreen.css'

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
      accountsLocked: props.settings.server.unlocked_accounts.length > 0,
      validationErrors: {}
    }
  }

  validateChange = e => {
    executeValidations(VALIDATIONS, this, e)
      ? this.props.onNotifyValidationsPassed(e.target.name)
      : this.props.onNotifyValidationError(e.target.name)
  }

  toggleAccountsLocked = () => {
    var toggleState = !this.state.accountsLocked
    var unlocked_accounts = this.props.settings.server.unlocked_accounts
    var total_accounts = this.props.settings.server.total_accounts

    if (toggleState == true) {
      this.props.settings.server.unlocked_accounts = new Array(total_accounts)

      for (var i = 0; i < total_accounts; i++) {
        this.props.settings.server.unlocked_accounts[i] = i
      }
    } else {
      this.props.settings.server.unlocked_accounts = []
    }

    this.setState({
      accountsLocked: toggleState
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
                value={this.props.settings.server.total_accounts}
                onChange={this.validateChange}
              />
              {this.state.validationErrors["server.total_accounts"] &&
                <p className={Styles.ValidationError}>Must be &gt; {VALIDATIONS["server.total_accounts"].min} and &lt; {VALIDATIONS["server.total_accounts"].max}</p>}
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
