import React, { Component } from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import OnlyIf from 'Elements/OnlyIf'

import Styles from '../ConfigScreen.css'

class ServerScreen extends Component {
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
                ref="hostName"
                name="hostName"
                defaultValue={this.props.formState.hostName}
              />
            </div>
            <div className={Styles.RowItem}>
              <p>
                The server will accept connections on the unspecified IPv6
                address (::) when IPv6 is available, or the unspecified IPv4
                address ({process.platform === 'darwin'
                  ? '0.0.0.0'
                  : 'localhost'}) as default.
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
                ref="portNumber"
                name="portNumber"
                defaultValue={this.props.formState.portNumber}
                onChange={e => {
                  e.persist()
                  this.props
                    .appCheckPort(this.refs.portNumber.value)
                    .then(this.props.handleInputChange.bind(null, e))
                }}
              />
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
                The port number is which port the RPC server will listen on.
                Default is 8545.
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
                ref="networkId"
                name="networkId"
                defaultValue={this.props.formState.networkId}
                onChange={this.props.handleInputChange}
              />
            </div>
            <div className={Styles.RowItem}>
              <p>
                Specify the network id the Ganache will use to identify itself
                (defaults to the current time or the network id of the forked
                blockchain if configured)
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
                  onChange={this.props.handleInputChange}
                  checked={this.props.formState.automine}
                />
                <label htmlFor="Automine">AUTOMINE ENABLED</label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>
                Automining mines new blocks and transactions instantaneously.
              </p>
            </div>
          </div>
        </section>

        <OnlyIf test={!this.props.formState.automine}>
          <section>
            <h4>MINING BLOCK TIME (SECONDS)</h4>
            <div className={Styles.Row}>
              <div className={Styles.RowItem}>
                <input
                  ref="blockTime"
                  name="blockTime"
                  type="text"
                  defaultValue={this.props.formState.blockTime}
                  onChange={this.props.handleInputChange}
                />
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

export default SettingsProvider(TestRPCProvider(ServerScreen))
