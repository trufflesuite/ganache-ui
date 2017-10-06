import React, { Component } from 'react'
import TestRPCProvider from 'Providers/TestRPCProvider'
import SettingsProvider from 'Providers/SettingsProvider'

import Styles from '../ConfigScreen.css'

class AccountsScreen extends Component {
  render () {
    return (
      <div>
        <h2>GANACHE SETTINGS</h2>
        <section>
          <h4>GOOGLE ANALYTICS</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="googleAnalyticsTracking"
                  id="GoogleAnalyticsTracking"
                  onChange={this.props.handleInputChange}
                  checked={this.props.formState.googleAnalyticsTracking}
                />
                <label htmlFor="GoogleAnalyticsTracking">
                  GOOGLE ANALYTICS
                </label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>
                We use Google Analytics to track rough Ganache usage. It is
                completely anonymous, and we respect your privacy so no detailed
                or otherwise sensitive information is collected. We use this
                because it helps guide us to where we should most focus our
                development efforts.{' '}
                <b>
                  We appreciate you helping us understand how people use
                  Ganache!
                </b>
              </p>
            </div>
          </div>
        </section>
        <section>
          <h4>CPU &amp; MEMORY PROFILING</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="cpuAndMemoryProfiling"
                  id="CpuAndMemoryProfiling"
                  onChange={this.props.handleInputChange}
                  checked={this.props.formState.cpuAndMemoryProfiling}
                />
                <label htmlFor="CpuAndMemoryProfiling">
                  CPU &amp; MEMORY PROFILING
                </label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>
                Strictly for debugging Ganache. Dumps detailed metrics to a log
                file. Only enable if you are asked to by Truffle support.
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default SettingsProvider(TestRPCProvider(AccountsScreen))
