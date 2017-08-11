import React, { Component } from 'react'

import { hashHistory } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import Styles from './FirstRunScreen.css'

class FirstRunScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      enableAnalytics: true
    }
  }

  _handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  _recordChoice = () => {
    this.props
      .appSetSettings({
        googleAnalyticsTracking: this.refs.enableAnalytics.checked,
        firstRun: false
      })
      .then(this.props.appGetSettings)
      .then(() => {
        hashHistory.push('/config')
      })
  }

  render () {
    return (
      <div className={Styles.FirstRunScreen}>
        <div className={Styles.Card}>
          <div className={Styles.MainContent}>
            <div className={Styles.LeftColumn}>
              <h1>SUPPORT THE DEVELOPMENT OF GANACHE</h1>
              <i>This is the only time you will see this screen.</i>
              <p>
                Like many Open Source projects, we use Google Analytics to track
                a handful of gross aggregate user activities. This helps us
                prioritize where to work, and gives metrics to support the
                further application of developer resources to move this project
                forward.
              </p>
              <p>
                By enabling this feature, you give back to the development team
                by providing us with valuable metrics that guide our time and
                priorities, and allow us to analyze usage patterns.
              </p>
              <p>If you choose to participate, we thank you greatly.</p>

              <i>The Truffle Team</i>
            </div>
            <div className={Styles.RightColumn}>
              <h4>WHAT WE TRACK</h4>
              <ul className={Styles.MetricList}>
                <li>
                  A unique UUID generated the first time Ganache is started
                </li>
                <li>Screen and window width and height</li>
                <li>The version of Ganache being used</li>
                <li>Exception messages (without paths)</li>
                <li>The current screen/tab navigated to</li>
              </ul>

              <strong className={Styles.Covenant}>
                At no time do we collect anything more, or anything that would
                be identifiable or sensitive in nature.
              </strong>
            </div>
          </div>
          <hr className={Styles.Rule} />
          <div className={Styles.Footer}>
            <div className={Styles.Control}>
              <h4>PARTICIPATE IN ANALYTICS</h4>

              <div className="Switch">
                <input
                  type="checkbox"
                  name="enableAnalytics"
                  ref="enableAnalytics"
                  id="EnableAnalytics"
                  onChange={this._handleInputChange}
                  checked={this.state.enableAnalytics}
                />
                <label htmlFor="EnableAnalytics">ENABLE ANALYTICS</label>
                {this.state.enableAnalytics
                  ? <i>Thank You :)</i>
                  : <i>You can always opt-in later via the Settings tab.</i>}
              </div>
            </div>
            <button className="btn btn-primary" onClick={this._recordChoice}>
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default TestRPCProvider(FirstRunScreen)
