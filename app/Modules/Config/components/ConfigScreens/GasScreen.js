import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

const VALIDATIONS = {
  "server.gasPrice": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true
  },
  "server.gasLimit": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true
  }
}

class AccountsScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS)
  }

  render () {
    return (
      <div>
        <h2>GAS OPTIONS</h2>
        <section>
          <h4>GAS LIMIT</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                name="server.gasLimit"
                type="text"
                value={this.props.settings.server.gasLimit}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.gasLimit"] &&
                <p className={Styles.ValidationError}>
                  Must be &ge; 1
                </p>}
            </div>
            <div className={Styles.RowItem}>
              <p>Maximum amount of gas available to each block and transaction. Leave blank for default.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>GAS PRICE</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                name="server.gasPrice"
                type="text"
                value={this.props.settings.server.gasPrice}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.gasPrice"] &&
                <p className={Styles.ValidationError}>
                  Must be &ge; 1
                </p>}
            </div>
            <div className={Styles.RowItem}>
              <p>The price of each unit of gas, in WEI. Leave blank for default.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default AccountsScreen
