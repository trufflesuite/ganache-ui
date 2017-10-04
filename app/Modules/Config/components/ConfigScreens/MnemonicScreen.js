import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

const VALIDATIONS = {
  mnemonicValue: {
    allowedChars: /^[a-zA-Z ]*$/
  }
}

class MnemonicScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      automnemonic: props.settings.mnemonic == null
    }
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS)
  }

  toggleAutoMnemonic () {
    var toggleValue = !this.state.automnemonic

    setState({
      automnemonic: toggleValue
    })
  }

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
                  onChange={this.toggleAutoMnemonic}
                  checked={this.state.automnemonic}
                />
                <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>Automatically generate mnemonic used to create available addresses.</p>
            </div>
          </div>
        </section>
        <section>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              {this.state.automnemonic
                ? <span>
                    <input
                      type="text"
                      placeholder="Enter Optional Seed Data"
                      name="server.seed"
                      value={this.props.settings.server.seed}
                      onChange={this.validateChange}
                    />
                  </span>
                : <span>
                    <input
                      type="text"
                      placeholder="Enter Mnemonic to use"
                      name="server.mnemonic"
                      value={this.props.settings.server.mnemonic}
                      onChange={this.validateChange}
                    />
                    {this.props.validationErrors["server.mnemonic"] &&
                      <p>Can only contain letters</p>}
                  </span>}
            </div>
            <div className={Styles.RowItem}>
              {this.state.automnemonic
                ? <p>Optional seed data for auto generated mnemonic</p>
                : <p>Enter the Mnemonic you wish to use.</p>}
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default MnemonicScreen
