import React, { Component } from 'react'
import connect from '../../Helpers/connect'
import Styles from '../ConfigScreen.css'

class GanacheScreen extends Component {
  render () {
    return (
      <div>
        <h2>ADVANCED SETTINGS</h2>
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
                  checked={this.props.settings.googleAnalyticsTracking == true}
                />
                <label htmlFor="GoogleAnalyticsTracking">
                  GOOGLE ANALYTICS
                </label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>
                We use Google Analytics to track Ganache usage. This information helps us gain more insight into how Ganache is used. This tracking is anonymous. We do not track personally identifiable information, account data or private keys.{' '}
              </p>
            </div>
          </div>
        </section>
        {/* <section>
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
        </section> */}
      </div>
    )
  }
}

export default GanacheScreen
