import React, {Component} from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import AppUpdaterProvider from 'Data/Providers/AppUpdaterProvider'

import Icon from 'Elements/Icon'
import OnlyIf from 'Elements/OnlyIf'
import HeaderBar from 'Elements/HeaderBar'

import GanacheLogo from 'Icons/ganache_logo.svg'
import SettingsIcon from 'Icons/settings.svg'
import RestartIcon from 'Icons/eject.svg'

import Styles from './ConfigScreen.css'

class ConfigTabItem extends Component {
  render () {
    const className = `${Styles.ConfigTabItem} ${this.props.isActive ? Styles.ActiveTab : ''}`
    return (
      <div className={className} onClick={this.props.onClick}>
        <h3 className={Styles.ConfigTabItemName}>{this.props.itemLabel}</h3>
      </div>
    )
  }
}

class ConfigScreen extends Component {
  state = {
    specificTime: false,
    opcodeDebug: false,
    automnemonic: true,
    automine: true,
    accountsLocked: false,
    forkChain: false,
    verboseLogging: false,
    activeTab: 'server'
  }

  componentDidMount () {
    this.props.appCheckPort(8545)
  }

  _handleTabSelection = (opt, e) => {
    this.setState({activeTab: opt.toLowerCase()})
  }

  render () {
    const { portIsClear } = this.props.testRpcState
    const portIsBlocked = portIsClear.status === 'blocked' && portIsClear.pid !== undefined && portIsClear.pid[0].name !== 'Ganache' && portIsClear.pid[0].name !== 'Electron'
    console.log(this.props)
    return (
      <main>
        <OnlyIf test={this.props.testRpcState.testRpcServerRunning}>
          <HeaderBar>
            <Icon glyph={SettingsIcon} size={32}/>
            <h4>SETTINGS</h4>
          </HeaderBar>
        </OnlyIf>
        <div className={Styles.ConfigScreen}>
          <OnlyIf test={!this.props.testRpcState.testRpcServerRunning}>
            <Icon glyph={GanacheLogo} size={128} className="isolate" strokeWidth={1}/>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.checkingForUpdate}>
            <p className={Styles.UpdateNotice}>Checking for Ganache Updates...</p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.haveLatestVersion}>
            <p className={Styles.UpdateNotice}>You have the most up-to-date version of Ganache.</p>
          </OnlyIf>
          <OnlyIf test={this.props.appUpdater.haveLatestVersion}>
            <p className={Styles.UpdateNotice}>You have the most up-to-date version of Ganache.</p>
          </OnlyIf>
          <div className={Styles.ConfigHeader}>
            <div className={Styles.ConfigTabs}>
              {
                ['Server', 'Accounts', 'Gas', 'Mnemonic', 'Logging', 'Forking'].map((opt, index) => {
                  return (
                    <ConfigTabItem
                      key={opt}
                      itemLabel={`${opt}`}
                      isActive={this.state.activeTab === opt.toLowerCase()}
                      onClick={this._handleTabSelection.bind(this, opt)}
                      >
                    </ConfigTabItem>
                  )
                })
              }
            </div>
            <OnlyIf test={!portIsBlocked}>
              <button className="btn btn-primary" onClick={this._startTestRpc}>
                <Icon glyph={RestartIcon} size={18} />
                {this.props.testRpcState.testRpcServerRunning
                  ? 'RESTART GANACHE'
                  : 'START GANACHE'
                }
              </button>
            </OnlyIf>
          </div>
          <form>
            <section className={Styles.ConfigCard}>
              <div className={ this.state.activeTab === 'server' ? Styles.Visible : Styles.Hidden}>
                <h2>RPC SERVER OPTIONS</h2>
                <section>
                  <h4>HOSTNAME</h4>
                  <div className={Styles.Row}>
                    <div className={Styles.RowItem}>
                      <input ref="hostName" type="text" name="hostName" defaultValue="0.0.0.0"/>
                    </div>
                    <div className={Styles.RowItem}>
                      <p>The server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) as default.</p>
                    </div>
                  </div>
                </section>
                <section>
                  <h4>PORT NUMBER</h4>
                  <div className={Styles.Row}>
                    <div className={Styles.RowItem}>
                      <input ref="portNumber" type="text" name="portNumber" defaultValue="8545" onChange={() => { this.props.appCheckPort(this.refs.portNumber.value) }} />
                      <OnlyIf test={portIsBlocked} >
                        <strong className={Styles.PortAlert}><b>WARNING!</b> Ganache cannot start on this port because there is already a process "<b>{portIsBlocked && portIsClear.pid[0].name}</b>" with PID <b>{portIsBlocked && portIsClear.pid[0].pid}</b> running on this port.</strong>
                      </OnlyIf>
                    </div>
                    <div className={Styles.RowItem}>
                      <p>The port number is which port the RPC server will listen on. Default is 8545.</p>
                    </div>
                  </div>
                </section>
                <section>
                  <h4>NETWORK ID</h4>
                  <div className={Styles.Row}>
                    <div className={Styles.RowItem}>
                      <input ref="networkId" type="text" name="networkId" defaultValue={Date.now()}/>
                    </div>
                    <div className={Styles.RowItem}>
                      <p>Specify the network id the Ganache will use to identify itself (defaults to the current time or the network id of the forked blockchain if configured)</p>
                    </div>
                  </div>
                </section>
                <section>
                  <h4>AUTOMINE</h4>
                  <div className={Styles.Row}>
                    <div className={Styles.RowItem}>
                      <div className="Switch">
                        <input type="checkbox" name="automine" id="Automine" onChange={this._handleInputChange} checked={this.state.automine} />
                        <label htmlFor="Automine">AUTOMINE ENABLED</label>
                      </div>
                    </div>
                    <div className={Styles.RowItem}>
                      <p>Automining mines new blocks and transactions instantaneously.</p>
                    </div>
                  </div>
                </section>
                { !this.state.automine
                  ? <section>
                  <h4>MINING BLOCK TIME (SECONDS)</h4>
                  <div className={Styles.Row}>
                    <div className={Styles.RowItem}>
                      <input ref="blockTime" type="text" defaultValue="1" />
                    </div>
                    <div className={Styles.RowItem}>
                      <p>The number of seconds to wait between mining new blocks and transactions.</p>
                    </div>
                  </div>
                </section>
                : null
              }
            </div>
            <div className={ this.state.activeTab === 'accounts' ? Styles.Visible : Styles.Hidden}>
              <h2>ACCOUNT OPTIONS</h2>
              <section>
                <h4>TOTAL ACCOUNTS TO GENERATE</h4>
                <div className={Styles.Row}>
                  <div className={Styles.RowItem}>
                    <input ref="totalAccounts" type="text" defaultValue="10" />
                  </div>
                  <div className={Styles.RowItem}>
                    <p>Total number of Accounts to create and pre-fund.</p>
                  </div>
                </div>
              </section>
              <section>
                <h4>CREATE LOCKED ACCOUNTS</h4>
                <div className={Styles.Row}>
                  <div className={Styles.RowItem}>
                    <div className="Switch">
                      <input type="checkbox" name="accountsLocked" id="AccountsLocked" onChange={this._handleInputChange} />
                      <label htmlFor="AccountsLocked">ACCOUNTS LOCKED</label>
                    </div>
                  </div>
                  <div className={Styles.RowItem}>
                    <p>Create accounts that are locked by default.</p>
                  </div>
                </div>
              </section>
            </div>
            <div className={ this.state.activeTab === 'gas' ? Styles.Visible : Styles.Hidden}>
              <h2>GAS OPTIONS</h2>
              <section>
                <h4>GAS PRICE</h4>
                <div className={Styles.Row}>
                  <div className={Styles.RowItem}>
                    <input ref="gasPrice" type="text" defaultValue="20000000000" />
                  </div>
                  <div className={Styles.RowItem}>
                    <p>The Gas Price in WEI to use. Default is 20000000000.</p>
                  </div>
                </div>
              </section>
              <section>
                <h4>GAS LIMIT</h4>
                <div className={Styles.Row}>
                  <div className={Styles.RowItem}>
                    <input ref="gasLimit" type="text" defaultValue="4712388" />
                  </div>
                  <div className={Styles.RowItem}>
                    <p>The Gas Limit to use.</p>
                  </div>
                </div>
              </section>
            </div>
            <div className={ this.state.activeTab === 'mnemonic' ? Styles.Visible : Styles.Hidden}>
              <h2>MNEMONIC OPTIONS</h2>
              <section>
                <h4>AUTOGENERATE HD MNEMONIC</h4>
                <div className={Styles.Row}>
                  <div className={Styles.RowItem}>
                    <div className="Switch">
                      <input type="checkbox" name="automnemonic" id="Mnemonic" onChange={this._handleInputChange} checked={this.state.automnemonic} />
                      <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
                    </div>
                  </div>
                  <div className={Styles.RowItem}>
                    <p>Auto generate a Mnemonic on startup.</p>
                  </div>
                </div>
              </section>
              <section>
                <div className={Styles.Row}>
                  <div className={Styles.RowItem}>
                    { this.state.automnemonic
                      ? <span><input ref={(i) => { this.seedData = i }} name="seedDataValue" defaultValue="" type="text" placeholder="Enter Optional Seed Data" /></span>
                      : <span><input ref={(i) => { this.mnemonicValue = i }} name="mnemonicValue" defaultValue="" type="text" placeholder="Enter Mnemonic to use" /></span>
                  }
                </div>
                <div className={Styles.RowItem}>
                  { this.state.automnemonic ?
                    <p>Optional seed data for auto generated mnemonic</p>
                    :
                    <p>Enter the Mnemonic you wish to use.</p>
                  }
                </div>
              </div>
            </section>
          </div>
          <div className={ this.state.activeTab === 'logging' ? Styles.Visible : Styles.Hidden}>
            <h2>LOGGING OPTIONS</h2>
            <section>
              <h4>ENABLE VM OPCODE DEBUG LOGGING</h4>
              <div className={Styles.Row}>
                <div className={Styles.RowItem}>
                  <div className="Switch">
                    <input type="checkbox" name="opcodeDebug" id="OpcodeDebug" onChange={this._handleInputChange} />
                    <label htmlFor="OpcodeDebug">ENABLE VM OPCODE DEBUG LOGGING</label>
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
                    <input type="checkbox" name="verboseLogging" id="VerboseLogging" onChange={this._handleInputChange} />
                    <label htmlFor="VerboseLogging">ENABLE VM OPCODE DEBUG LOGGING</label>
                  </div>
                </div>
                <div className={Styles.RowItem}>
                  <p>Enable verbose logging to the Console.</p>
                </div>
              </div>
            </section>
          </div>
          <div className={ this.state.activeTab === 'forking' ? Styles.Visible : Styles.Hidden}>
            <h2>FORK CHAIN</h2>
            <section>
              <h4>ENABLE CHAIN FORKING</h4>
              <div className={Styles.Row}>
                <div className={Styles.RowItem}>
                  <div className="Switch">
                    <input type="checkbox" name="forkChain" id="ForkChain" onChange={this._handleInputChange} />
                    <label htmlFor="ForkChain">FORK CHAIN</label>
                  </div>
                </div>
                <div className={Styles.RowItem}>
                  <p>Fork a chain and use it for the initial starting point.</p>
                </div>
              </div>
            </section>
            <section>
              { this.state.forkChain
                ? <div className={Styles.Row}>
                <div className={Styles.RowItem}>
                  <input type="text" ref="fork" placeholder="URL to target Chain" />
                </div>
                <div className={Styles.RowItem}>
                  <p>A URL pointing to the chain to fork.</p>
                </div>
              </div>
              : null }
            </section>
          </div>
        </section>
      </form>
    </div>
  </main>
)
}

_handleInputChange = (event) => {
  const target = event.target
  const value = target.type === 'checkbox' ? target.checked : target.value
  const name = target.name
  this.setState({
    [name]: value
  })
}

_startTestRpc = (e) => {
  e.preventDefault()

  const config = {
    port: this.refs.portNumber.value,
    time: this.refs.time ? this.refs.time.value : null,
    fork: this.refs.fork ? this.refs.fork.value : null,
    gasPrice: parseInt(this.refs.gasPrice.value, 10),
    gasLimit: parseInt(this.refs.gasLimit.value, 10),
    blocktime: this.state.automine ? null : this.refs.blockTime.value,
    debug: this.state.opcodeDebug,
    verbose: this.state.verboseLogging,
    mnemonic: this.state.automnemonic ? null : this.mnemonicValue,
    seed: this.seedData ? this.seedData.value : null,
    total_accounts: this.refs.totalAccounts ? this.refs.totalAccounts.value : null,
    secure: this.state.accountsLocked,
    hostname: this.refs.hostName.value,
    network_id: this.refs.networkId.value
  }

  Object.keys(config).forEach((key) => { !config[key] ? delete config[key] : null })

  this.state.automine ? delete config['time'] : null

  if (this.props.testRpcState.testRpcServerRunning) {
    this.props.appRestartRpcService(config)
  } else {
    this.props.appStartRpcService(config)
  }
}
}

export default AppUpdaterProvider(TestRPCProvider(ConfigScreen))
