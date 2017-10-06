import React, { Component } from 'react'
import TestRPCProvider from 'Providers/TestRPCProvider'
import SettingsProvider from 'Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

class AccountsScreen extends Component {
  render () {
    return (
      <div>
        <h2>LOGGING OPTIONS</h2>
        <section>
          <h4>ENABLE VM OPCODE DEBUG LOGGING</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="opcodeDebug"
                  id="OpcodeDebug"
                  checked={this.props.formState.opcodeDebug}
                  onChange={this.props.handleInputChange}
                />
                <label htmlFor="OpcodeDebug">
                  ENABLE VM OPCODE DEBUG LOGGING
                </label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>Log VM Opcodes to the Console.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>VERBOSE LOGGING</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="verboseLogging"
                  id="VerboseLogging"
                  checked={this.props.formState.verboseLogging}
                  onChange={this.props.handleInputChange}
                />
                <label htmlFor="VerboseLogging">
                  ENABLE VM OPCODE DEBUG LOGGING
                </label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>Enable verbose logging to the Console.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default SettingsProvider(TestRPCProvider(AccountsScreen))
