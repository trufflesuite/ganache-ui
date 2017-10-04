import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import OnlyIf from 'Elements/OnlyIf'

import Styles from '../ConfigScreen.css'

import executeValidations from './Validator'

const VALIDATIONS = {
  "server.hostname": {
    format: /(localhost)|(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)/,
  },
  "server.port": {
    allowedChars: /^\d*$/,
    min: 1025,
    max: 65535
  },
  "server.network_id": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true
  },
  "server.blocktime": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 200,
    canBeBlank: true
  }
}

class ServerScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      hostNameValidationError: false,
      portNumberValidationError: false,
      networkIdValidationError: false,
      automine: typeof props.settings.server.blocktime == "undefined" 
    }
  }

  validateChange = e => {
    executeValidations(VALIDATIONS, this, e)
      ? this.props.onNotifyValidationsPassed(e.target.name)
      : this.props.onNotifyValidationError(e.target.name)
  }

  toggleAutomine = () => {
    var newValue = !this.state.automine

    // Remove blocktime value if we turn automine on
    if (newValue == true) {
      delete this.props.settings.server.blocktime

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "server.blocktime",
          value: ""
        }
      })
    }

    this.setState({
      automine: !this.state.automine
    })
  }

  render () {
    const { ganachePortStatus } = this.props.testRpcState
    const portIsBlocked =
      ganachePortStatus.status === 'blocked' &&
      ganachePortStatus.pid !== undefined &&
      !ganachePortStatus.pid[0].name.toLowerCase().includes('ganache') &&
      !ganachePortStatus.pid[0].name.toLowerCase().includes('electron')

    return (
      <div>
        <h2>RPC SERVER OPTIONS</h2>

        <section>
          <h4>HOSTNAME</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                type="text"
                name="server.hostname"
                className={
                  this.state.hostNameValidationError && Styles.ValidationError
                }
                value={this.props.settings.server.hostname}
                onChange={this.validateChange}
              />
              {this.state.hostNameValidationError &&
                <p>The host must be a valid IP address.</p>}
            </div>
            <div className={Styles.RowItem}>
              <p>
                The server will accept RPC connections on the following host and port.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>PORT NUMBER</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                type="text"
                name="server.port"
                className={
                  this.state.portNumberValidationError && Styles.ValidationError
                }
                value={this.props.settings.server.port}
                onChange={e => {
                  this.props.appCheckPort(e.target.value)
                  this.validateChange(e)
                }}
              />

              {this.state.portNumberValidationError &&
                <p>The port number must be &gt; 1000 and &lt; 65535.</p>}

              <OnlyIf test={portIsBlocked}>
                <strong className={Styles.PortAlert}>
                  <b>WARNING!</b> Ganache cannot start on this port because
                  there is already a process "<b>
                    {portIsBlocked && ganachePortStatus.pid[0].name}
                  </b>" with PID{' '}
                  <b>{portIsBlocked && ganachePortStatus.pid[0].pid}</b> running
                  on this port.
                </strong>
              </OnlyIf>
            </div>
            <div className={Styles.RowItem}>
              <p>
                &nbsp;
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>NETWORK ID</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <input
                type="text"
                name="server.network_id"
                className={
                  this.state.networkIdValidationError && Styles.ValidationError
                }
                value={this.props.settings.server.network_id}
                onChange={this.validateChange}
              />
              {this.state.networkIdValidationError &&
                <p>
                  The Network ID can be blank, or must be &gt; 1 and &lt;{' '}
                  {Number.MAX_SAFE_INTEGER}.
                </p>}
            </div>
            <div className={Styles.RowItem}>
              <p>
                Internal blockchain identifier of Ganache server.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>AUTOMINE</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="automine"
                  id="Automine"
                  onChange={this.toggleAutomine}
                  checked={this.state.automine}
                />
                <label htmlFor="Automine">AUTOMINE ENABLED</label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>
                Process transactions instantaneously.
              </p>
            </div>
          </div>
        </section>

        <OnlyIf test={!this.state.automine}>
          <section>
            <h4>MINING BLOCK TIME (SECONDS)</h4>
            <div className={Styles.Row}>
              <div className={Styles.RowItem}>
                <input
                  name="server.blocktime"
                  type="text"
                  value={this.props.settings.server.blockTime}
                  onChange={this.validateChange}
                />
                {this.state.blockTimeValidationError &&
                  <p>The Mining Time must be &gt; 1 and &lt; 200.</p>}
              </div>
              <div className={Styles.RowItem}>
                <p>
                  The number of seconds to wait between mining new blocks and
                  transactions.
                </p>
              </div>
            </div>
          </section>
        </OnlyIf>
      </div>
    )
  }
}

export default TestRPCProvider(ServerScreen)
