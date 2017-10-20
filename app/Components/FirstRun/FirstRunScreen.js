import React, { Component } from 'react'

import { push } from 'react-router-redux'
import connect from '../Helpers/connect'

import * as Settings from '../../Actions/Settings'

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
    var newSettings = Object.assign({}, this.props.settings, {
      firstRun: false,
      googleAnalyticsTracking: this.state.enableAnalytics
    })

    this.props.dispatch(Settings.setSettings(newSettings))
    this.props.dispatch(push('/accounts'))
  }

  render () {
    return (
      <div className="FirstRunScreen">
        <div className="Card">
          <div className="MainContent">
            <div className="LeftColumn">
              <div className="Logo"></div>
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
            <div className="RightColumn">
              <h1>&nbsp;</h1>
              <h4>WHAT WE TRACK</h4>
              <ul className="MetricList">
                <li>
                  <span>A unique UUID generated upon first use</span>
                </li>
                <li><span>Window width and height</span></li>
                <li><span>Ganache version</span></li>
                <li><span>Exception messages (without paths)</span></li>
                <li><span>Screens viewed during use</span></li>
              </ul>

              <strong className="Covenant">
                We do not collect addresses or private keys.
              </strong>
            </div>
          </div>
          <div className="Rule" />
          <div className="Footer">
            <div className="Control">
              
              <div className="Switch">
                <input
                  type="checkbox"
                  name="enableAnalytics"
                  ref="enableAnalytics"
                  id="EnableAnalytics"
                  onChange={this._handleInputChange}
                  checked={this.state.enableAnalytics}
                />
                <label htmlFor="EnableAnalytics" className="SwitchLabel">ENABLE ANALYTICS</label>
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

export default connect(FirstRunScreen, "settings")
