import React, { PureComponent } from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'

import Icon from 'Elements/Icon'
import OnlyIf from 'Elements/OnlyIf'

import Tabs from './Tabs/Tabs'

import ServerScreen from './ConfigScreens/ServerScreen'
import AccountsScreen from './ConfigScreens/AccountsScreen'
import MnemonicScreen from './ConfigScreens/MnemonicScreen'
import GanacheScreen from './ConfigScreens/GanacheScreen'
import GasScreen from './ConfigScreens/GasScreen'
import LoggingScreen from './ConfigScreens/LoggingScreen'
import ForkingScreen from './ConfigScreens/ForkingScreen'

import GanacheLogo from 'Resources/logo.png'
import RestartIcon from 'Icons/eject.svg'

import Styles from './ConfigScreen.css'

class ConfigScreen extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      specificTime: false,
      opcodeDebug: false,
      automnemonic: true,
      automine: true,
      accountsLocked: false,
      forkChain: false,
      verboseLogging: false,
      googleAnalyticsTracking: false,
      cpuAndMemoryProfiling: false,
      settingsDirty: false,
      isStartDisabled: false,
      portNumber: 8545,
      time: null,
      fork: null,
      seedData: null,
      mnemonicValue: null,
      seed: null,
      total_accounts: 10,
      secure: false,
      hostName: '0.0.0.0',
      network_id: 1234
    }
  }

  componentDidMount () {
    this.props.appCheckPort(8545)
    this.props.appGetSettings()
  }

  _renderConfigTabs = () => {
    return [
      'Server',
      'Accounts',
      'Gas',
      'Mnemonic',
      'Logging',
      'Forking',
      'Ganache'
    ].map((opt, index) => {
      return (
        <Tabs.Tab key={opt} className={Styles.ConfigTabItem}>
          {opt}
        </Tabs.Tab>
      )
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
      <main>
        <Tabs className={Styles.ConfigScreen}>
          <OnlyIf test={!this.props.testRpcState.testRpcServerRunning}>
            <img src={GanacheLogo} width={'100px'} height={'100px'} />
          </OnlyIf>
          <Tabs.TabHeader>
            <Tabs.TabList className={Styles.ConfigTabs}>
              {this._renderConfigTabs()}
            </Tabs.TabList>
            <Tabs.TabActions>
              <button
                className="btn btn-primary"
                onClick={this._startTestRpc}
                disabled={this.state.isStartDisabled || portIsBlocked}
              >
                <Icon glyph={RestartIcon} size={18} />
                {this.props.testRpcState.testRpcServerRunning
                  ? 'RESTART GANACHE'
                  : 'START GANACHE'}
              </button>
            </Tabs.TabActions>
          </Tabs.TabHeader>

          <Tabs.TabPanels className={Styles.ConfigCard}>
            <Tabs.TabPanel>
              <ServerScreen
                formState={this.state}
                handleInputChange={this._handleInputChange}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <AccountsScreen
                formState={this.state}
                handleInputChange={this._handleInputChange}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <GasScreen
                formState={this.state}
                handleInputChange={this._handleInputChange}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <MnemonicScreen
                formState={this.state}
                handleInputChange={this._handleInputChange}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <LoggingScreen
                formState={this.state}
                handleInputChange={this._handleInputChange}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ForkingScreen
                formState={this.state}
                handleInputChange={this._handleInputChange}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <GanacheScreen
                formState={this.state}
                handleInputChange={this._handleInputChange}
              />
            </Tabs.TabPanel>
          </Tabs.TabPanels>
        </Tabs>
      </main>
    )
  }

  _handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.setState({
      [name]: value,
      settingsDirty: true
    })
  }

  _startTestRpc = e => {
    e.preventDefault()
    this.setState({ isStartDisabled: true })

    this.props.appSetSettings({
      googleAnalyticsTracking: this.state.googleAnalyticsTracking,
      cpuAndMemoryProfiling: this.state.cpuAndMemoryProfiling
    })

    const config = {
      port: this.state.portNumber,
      time: this.state.time,
      fork: this.state.fork,
      gasPrice: parseInt(this.state.gasPrice, 10),
      gasLimit: parseInt(this.state.gasLimit, 10),
      blocktime: this.state.automine ? null : this.state.blockTime,
      debug: this.state.opcodeDebug,
      verbose: this.state.verboseLogging,
      mnemonic: this.state.automnemonic
        ? null
        : this.state.mnemonicValue.toLowerCase(),
      seed: this.seedData ? this.state.seedData : null,
      total_accounts: this.state.totalAccounts,
      secure: this.state.accountsLocked,
      hostname: this.state.hostName,
      network_id: this.state.networkId
    }

    Object.keys(config).forEach(key => {
      !config[key] ? delete config[key] : null
    })

    this.state.automine ? delete config['time'] : null

    if (this.props.testRpcState.testRpcServerRunning) {
      this.props.appRestartRpcService(config).then(this.props.appGetSettings())
    } else {
      this.props.appStartRpcService(config)
    }
  }
}

export default SettingsProvider(TestRPCProvider(ConfigScreen))
