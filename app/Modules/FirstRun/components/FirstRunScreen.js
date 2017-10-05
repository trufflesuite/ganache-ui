import React, { Component } from 'react'

import { hashHistory } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import GanacheLogo from 'Resources/logo.png'

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
        hashHistory.push('/accounts')
      })
  }

  render () {
    return (
      <div className={Styles.FirstRunScreen}>
        <div className={Styles.Card}>
          <div className={Styles.MainContent}>
            <div className={Styles.LeftColumn}>
            <div   className={Styles.Logo}>
                <img src={GanacheLogo} width={'64px'} height={'64px'} />
              </div>
              <h1>
                SUPPORT GANACHE
              </h1>
              <p>
                Ganache includes Google Analytics tracking to help us better understand 
                how you use Ganache during your normal development practices. You can
                opt-out of this tracking by selecting the option below.
              </p>
              <p>
                By enabling this feature, you provide the Truffle team
                with valuable metrics, allowing us to better analyze usage
                patterns and add new features and bug fixes faster.
              </p>
              <p>
                Thanks for your help, and happy coding! 
              </p>
              <p>
                <i>-- The Truffle Team</i>
              </p>
            </div>
            <div className={Styles.RightColumn}>
              <h1>&nbsp;</h1>
              <h4>WHAT WE TRACK</h4>
              <ul className={Styles.MetricList}>
                <li>
                  <span>A unique UUID generated upon first use</span>
                </li>
                <li><span>Window width and height</span></li>
                <li><span>Ganache version</span></li>
                <li><span>Exception messages (without paths)</span></li>
                <li><span>Screens viewed during use</span></li>
              </ul>

              <strong className={Styles.Covenant}>
                We do not collect addresses or private keys.
              </strong>
            </div>
          </div>
          <div className={Styles.Rule} />
          <div className={Styles.Footer}>
            <div className={Styles.Control}>
              
              <div className="Switch">
                <input
                  type="checkbox"
                  name="enableAnalytics"
                  ref="enableAnalytics"
                  id="EnableAnalytics"
                  onChange={this._handleInputChange}
                  checked={this.state.enableAnalytics}
                />
                <label htmlFor="EnableAnalytics" className={Styles.SwitchLabel}>ENABLE ANALYTICS</label>
                {this.state.enableAnalytics
                  ? <span>Analytics enabled. Thanks!</span>
                  : <span>You've opted out. You can always opt-in later via the Settings tab. </span>}
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

export default SettingsProvider(TestRPCProvider(FirstRunScreen))
