import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

import OnlyIf from 'Elements/OnlyIf'

const VALIDATIONS = {
  mnemonicValue: {
    allowedChars: /^[a-zA-Z ]*$/,
    canBeBlank: true
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

  toggleAutoMnemonic = () => {
    var toggleValue = !this.state.automnemonic

     // Remove mnemonic if we turn automnemonic on
     if (toggleValue == true) {
      delete this.props.settings.server.blocktime

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "server.mnemonic",
          value: ""
        }
      })
    }

    this.setState({
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

        <OnlyIf test={!this.state.automnemonic}>
          <section>
            <div className={Styles.Row}>
              <div className={Styles.RowItem}>
                <input
                  type="text"
                  placeholder="Enter Mnemonic to use"
                  name="server.mnemonic"
                  value={this.props.settings.server.mnemonic || ""}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors["server.mnemonic"] &&
                  <p>Must be at least 12 words long and only contain letters</p>}
              </div>
              <div className={Styles.RowItem}>
                <p>Enter the Mnemonic you wish to use.</p>
              </div>
            </div>
          </section>
        </OnlyIf>
      </div>
    )
  }
}

export default MnemonicScreen
