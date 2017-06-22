import React, {Component} from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'

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

  _handleTabSelection = (opt, e) => {
    this.setState({activeTab: opt.toLowerCase()})
  }

  render () {
    return (
      <div className={Styles.ConfigScreen}>
        <header className={Styles.ConfigScreenHeader}>
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
        </header>
        <form>
          <section className={Styles.ConfigCard}>
              <div className={ this.state.activeTab === 'server' ? Styles.Visible : Styles.Hidden}>
                <h2>RPC SERVER OPTIONS</h2>
                <section>
                  <h4>PORT NUMBER</h4>
                  <input ref="portNumber" type="text" name="portNumber" defaultValue="8545"/>
                </section>
                <section>
                  <h4>AUTOMINE</h4>
                  <div className="Switch">
                    <input type="checkbox" name="automine" id="Automine" onChange={this._handleInputChange} checked={this.state.automine} />
                    <label htmlFor="Automine">AUTOMINE</label>
                  </div>
                </section>
                  { !this.state.automine
                    ? <section>
                      <h4>MINING BLOCK TIME (SECONDS)</h4>
                      <input ref="blockTime" type="text" defaultValue="1" />
                    </section>
                    : null
                  }
              </div>
              <div className={ this.state.activeTab === 'accounts' ? Styles.Visible : Styles.Hidden}>
                <h2>ACCOUNT OPTIONS</h2>
                <section>
                  <h4>TOTAL ACCOUNTS TO GENERATE</h4>
                  <input ref="totalAccounts" type="text" defaultValue="6" />
                </section>
                <section>
                  <h4>CREATE LOCKED ACCOUNTS</h4>
                  <div className="Switch">
                    <input type="checkbox" name="accountsLocked" id="AccountsLocked" onChange={this._handleInputChange} />
                    <label htmlFor="AccountsLocked">ACCOUNTS LOCKED</label>
                  </div>
                </section>
              </div>
              <div className={ this.state.activeTab === 'gas' ? Styles.Visible : Styles.Hidden}>
                <h2>GAS OPTIONS</h2>
                <section>
                  <h4>GAS PRICE</h4>
                  <input ref="gasPrice" type="text" defaultValue="1" />
                </section>
                <section>
                  <h4>GAS LIMIT</h4>
                  <input ref="gasLimit" type="text" defaultValue="4712388" />
                </section>
              </div>
              <div className={ this.state.activeTab === 'mnemonic' ? Styles.Visible : Styles.Hidden}>
                <h2>MNEMONIC OPTIONS</h2>
                <section>
                  <h4>AUTOGENERATE HD MNEMONIC</h4>
                  <div className="Switch">
                    <input type="checkbox" name="mnemonic" id="Mnemonic" onChange={this._handleInputChange} checked={this.state.automnemonic} />
                    <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
                  </div>
                </section>
                <section>
                  { this.state.automnemonic
                    ? <span><input ref={(i) => { this.seedData = i }} name="seedDataValue" defaultValue="" type="text" placeholder="Enter Optional Seed Data" /></span>
                    : <span><input ref={(i) => { this.automnemonic = i }} name="mnemonicValue" defaultValue="" type="text" placeholder="Enter Mnemonic to use" /></span>
                  }
                </section>
              </div>
              <div className={ this.state.activeTab === 'logging' ? Styles.Visible : Styles.Hidden}>
                <h2>LOGGING OPTIONS</h2>
                <section>
                  <h4>ENABLE VM OPCODE DEBUG LOGGING</h4>
                  <div className="Switch">
                    <input type="checkbox" name="opcodeDebug" id="OpcodeDebug" onChange={this._handleInputChange} />
                    <label htmlFor="OpcodeDebug">ENABLE VM OPCODE DEBUG LOGGING</label>
                  </div>
                </section>
                <section>
                  <h4>VERBOSE LOGGING</h4>
                  <div className="Switch">
                    <input type="checkbox" name="verboseLogging" id="VerboseLogging" onChange={this._handleInputChange} />
                    <label htmlFor="VerboseLogging">ENABLE VM OPCODE DEBUG LOGGING</label>
                  </div>
                </section>
              </div>
              <div className={ this.state.activeTab === 'forking' ? Styles.Visible : Styles.Hidden}>
                <h2>FORK CHAIN</h2>
                <section>
                  <h4>ENABLE CHAIN FORKING</h4>
                  <div className="Switch">
                  <input type="checkbox" name="forkChain" id="ForkChain" onChange={this._handleInputChange} />
                  <label htmlFor="ForkChain">FORK CHAIN</label>
                </div>
              </section>
              <section>
                { this.state.forkChain
                  ? <section><input type="text" ref="fork" placeholder="URL to target Chain" /></section>
                  : null }
              </section>
              </div>
          </section>
          <footer>
            <button className="btn btn-primary" onClick={this._startTestRpc}>START GANACHE</button>
          </footer>
        </form>
      </div>
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
      mnemonic: this.automnemonic ? true : null,
      seed: this.seedData ? this.seedData.value : null,
      total_accounts: this.refs.totalAccounts ? this.refs.totalAccounts.value : null,
      secure: this.state.accountsLocked
    }

    Object.keys(config).forEach((key) => { !config[key] ? delete config[key] : null })

    this.state.automine ? delete config['time'] : null

    this.props.appStartRpcService(config)
  }
}

export default TestRPCProvider(ConfigScreen)
