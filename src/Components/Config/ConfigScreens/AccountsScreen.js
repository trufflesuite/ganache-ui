import React, { Component } from 'react'

import OnlyIf from '../../../Elements/OnlyIf'

const VALIDATIONS = {
  "server.total_accounts": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 100
  },
  "server.default_balance_ether": {
    allowedChars: /^[0-9]*\.?[0-9]*$/,
    min: 0
  }
}

class AccountsScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      accountsLocked: !!props.config.settings.server.unlocked_accounts,
      automnemonic: props.config.settings.randomizeMnemonicOnStart
    }
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS)
  }

  toggleAccountsLocked = () => {
    var toggleState = !this.state.accountsLocked
    var unlocked_accounts = this.props.config.settings.server.unlocked_accounts
    var total_accounts = this.props.config.settings.server.total_accounts

    if (toggleState == true) {
      this.props.config.settings.server.unlocked_accounts = new Array(total_accounts)

      for (var i = 0; i < total_accounts; i++) {
        this.props.config.settings.server.unlocked_accounts[i] = i
      }
    } else {
      this.props.config.settings.server.unlocked_accounts = []
    }

    this.setState({
      accountsLocked: toggleState
    })
  }

  toggleAutoMnemonic = () => {
    var toggleValue = !this.state.automnemonic

    // Remove mnemonic if we turn automnemonic on
    this.props.config.settings.randomizeMnemonicOnStart = toggleValue

    this.validateChange({
      target: {
        name: "randomizeMnemonicOnStart",
        value: toggleValue
      }
    })

    this.setState({
      automnemonic: toggleValue
    })
  }

  cleanNumber(value) {
    if (isNaN(value) || value === null || value === undefined) {
      return ""
    }
    else {
      return value
    }
  }

  render () {
    return (
      <div>
        <h2>ACCOUNTS &amp; KEYS</h2>
        <section>
          <h4>ACCOUNT DEFAULT BALANCE</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="server.default_balance_ether"
                type="text"
                data-type="number"
                value={this.cleanNumber(this.props.config.settings.server.default_balance_ether)}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.default_balance_ether"] &&
                <p className="ValidationError">Must be a valid number that is at least {VALIDATIONS["server.default_balance_ether"].min}</p>}
            </div>
            <div className="RowItem">
              <p>The starting balance for accounts, in Ether.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>TOTAL ACCOUNTS TO GENERATE</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="server.total_accounts"
                type="text"
                data-type="number"
                value={this.cleanNumber(this.props.config.settings.server.total_accounts)}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.total_accounts"] &&
                <p className="ValidationError">Must be &gt; {VALIDATIONS["server.total_accounts"].min} and &lt; {VALIDATIONS["server.total_accounts"].max}</p>}
            </div>
            <div className="RowItem">
              <p>Total number of Accounts to create and pre-fund.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>AUTOGENERATE HD MNEMONIC</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="automnemonic"
                  id="Mnemonic"
                  onChange={this.toggleAutoMnemonic}
                  checked={this.state.automnemonic}
                />
                <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
              </div>
            </div>
            <div className="RowItem">
              <p>Turn on to automatically generate a new mnemonic and account addresses on each run.</p>
            </div>
          </div>
        </section>

        <OnlyIf test={!this.state.automnemonic}>
          <section>
            <div className="Row">
              <div className="RowItem">
                <input
                  type="text"
                  placeholder="Enter Mnemonic to use"
                  name="server.mnemonic"
                  value={this.props.config.settings.server.mnemonic || ""}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors["server.mnemonic"] &&
                  <p>Must be at least 12 words long and only contain letters</p>}
              </div>
              <div className="RowItem">
                <p>Enter the Mnemonic you wish to use.</p>
              </div>
            </div>
          </section>
        </OnlyIf>

        <section>
          <h4>LOCK ACCOUNTS</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="server.locked"
                  id="LockAccounts"
                  checked={this.props.config.settings.server.locked}
                  onChange={this.props.handleInputChange}
                />
                <label htmlFor="LockAccounts">LOCK ACCOUNTS</label>
              </div>
            </div>
            <div className="RowItem">
              <p>If enabled, accounts will be locked on startup.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default AccountsScreen
