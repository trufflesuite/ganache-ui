import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

class AccountsScreen extends Component {
  render () {
    return (
      <div>
        <h2>MNEMONIC OPTIONS</h2>
        <section>
          <h4>AUTOGENERATE HD MNEMONIC</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="automnemonic"
                  id="Mnemonic"
                  onChange={this.props.handleInputChange}
                  checked={this.props.formState.automnemonic}
                />
                <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>Auto generate a Mnemonic on startup.</p>
            </div>
          </div>
        </section>
        <section>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              {this.props.formState.automnemonic
                ? <span>
                    <input
                      ref={i => {
                        this.seedData = i
                      }}
                      name="seedDataValue"
                      defaultValue={this.props.formState.seedDataValue}
                      type="text"
                      placeholder="Enter Optional Seed Data"
                      onChange={this.props.handleInputChange}
                    />
                  </span>
                : <span>
                    <input
                      ref={i => {
                        this.mnemonicValue = i
                      }}
                      name="mnemonicValue"
                      defaultValue={this.props.formState.mnemonicValue}
                      type="text"
                      placeholder="Enter Mnemonic to use"
                      onChange={this.props.handleInputChange}
                    />
                  </span>}
            </div>
            <div className={Styles.RowItem}>
              {this.props.formState.automnemonic
                ? <p>Optional seed data for auto generated mnemonic</p>
                : <p>Enter the Mnemonic you wish to use.</p>}
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default SettingsProvider(TestRPCProvider(AccountsScreen))
