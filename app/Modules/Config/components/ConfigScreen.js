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

const DEFAULT_STATE = {
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
  blockTime: 1,
  time: null,
  fork: '',
  seedDataValue: '',
  mnemonicValue: '',
  seed: null,
  totalAccounts: 10,
  secure: false,
  hostName: process.platform === 'darwin' ? '0.0.0.0' : 'localhost',
  networkId: '',
  gasPrice: 20000000000,
  gasLimit: 4712388
}

class ConfigScreen extends PureComponent {
  constructor (props) {
    super(props)

    this.state = DEFAULT_STATE
  }

  componentDidMount () {
    this.props.appCheckPort(this.state.portNumber)
    this.props.appGetSettings()

    if (this.props.testRpcState.testRpcServerRunning) {
      this.setState({
        hostName: this.props.testRpcState.host,
        portNumber: this.props.testRpcState.port,
        networkId: this.props.testRpcState.networkId,
        automine: !this.props.testRpcState.isMiningOnInterval,
        gasLimit: this.props.testRpcState.gasLimit,
        gasPrice: this.props.testRpcState.gasPrice,
        totalAccounts: this.props.testRpcState.totalAccounts,
        blockTime:
          this.props.testRpcState.blocktime !== 'Automining'
            ? this.props.testRpcState.blocktime
            : 1
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    let newSettings = {}

    Object.keys(nextProps.settings).map(key => {
      if (
        !this.state.settingsDirty &&
        nextProps.settings[key] !== this.state[key]
      ) {
        console.log(`${key} = ${nextProps.settings[key]}`)
        newSettings[key] = nextProps.settings[key]
      }
    })

    if (Object.keys(newSettings).length > 0) {
      this.setState(newSettings)
    }
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
      fork: this.state.fork !== '' ? this.state.fork : null,
      gasPrice: parseInt(this.state.gasPrice, 10),
      gasLimit: parseInt(this.state.gasLimit, 10),
      blocktime: this.state.automine ? null : this.state.blockTime,
      debug: this.state.opcodeDebug,
      verbose: this.state.verboseLogging,
      mnemonic: this.state.automnemonic
        ? null
        : this.state.mnemonicValue.toLowerCase(),
      seed: this.state.seedDataValue !== '' ? this.state.seedDataValue : null,
      total_accounts: this.state.totalAccounts,
      secure: this.state.accountsLocked,
      hostname: this.state.hostName,
      network_id: this.state.networkId === '' ? null : this.state.networkId
    }

    Object.keys(config).forEach(key => {
      !config[key] ? delete config[key] : null
    })

    this.state.automine && delete config['time']

    if (this.props.testRpcState.testRpcServerRunning) {
      this.props.appRestartRpcService(config).then(this.props.appGetSettings())
    } else {
      this.props.appStartRpcService(config)
    }
  }
}

export default SettingsProvider(TestRPCProvider(ConfigScreen))
