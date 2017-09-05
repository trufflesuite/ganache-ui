import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

import executeValidations from './Validator'

const VALIDATIONS = {
  gasPrice: {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER
  },
  gasLimit: {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER
  }
}

class AccountsScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      gasPriceValidationError: false,
      gasLimitValidationError: false
    }
  }

  validateChange = e => {
    executeValidations(VALIDATIONS, this, e)
      ? this.props.onNotifyValidationsPassed(e.target.name)
      : this.props.onNotifyValidationError(e.target.name)
  }

  render () {
    return (
      <div>
        <h2>GAS OPTIONS</h2>
        <section>
          <h4>GAS PRICE</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                name="gasPrice"
                type="text"
                className={
                  this.state.gasPriceValidationError && Styles.ValidationError
                }
                value={this.props.formState.gasPrice}
                onChange={this.validateChange}
              />
              {this.state.gasPriceValidationError &&
                <p>
                  The Gas Price must be &ge; 1 and &lt;{' '}
                  {Number.MAX_SAFE_INTEGER}.
                </p>}
            </div>
            <div className={Styles.RowItem}>
              <p>The Gas Price in WEI to use. Default is 20000000000.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>GAS LIMIT</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                name="gasLimit"
                type="text"
                className={
                  this.state.gasLimitValidationError && Styles.ValidationError
                }
                value={this.props.formState.gasLimit}
                onChange={this.validateChange}
              />
              {this.state.gasLimitValidationError &&
                <p>
                  The Gas Limit must be &ge; 1 and &lt;{' '}
                  {Number.MAX_SAFE_INTEGER}.
                </p>}
            </div>
            <div className={Styles.RowItem}>
              <p>The Gas Limit to use.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default SettingsProvider(TestRPCProvider(AccountsScreen))
