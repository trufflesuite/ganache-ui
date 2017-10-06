import URL from 'url'
import React, { PureComponent } from 'react'
import { hashHistory } from 'react-router'
import _ from 'lodash'

import TestRPCProvider from 'Providers/TestRPCProvider'
import SettingsProvider from 'Providers/SettingsProvider'

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
import RestartIcon from 'Icons/restart.svg'
import EjectIcon from 'Icons/eject.svg';

import Styles from './ConfigScreen.css'

class ConfigScreen extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      settings: _.cloneDeep(props.settings),
      validationErrors: {}
    }
  }

  componentDidMount () {
    this.props.appCheckPort(this.state.portNumber)
    //this.props.appGetSettings()
  }

  componentWillReceiveProps (nextProps) {
    // let newSettings = {}

    // Object.keys(nextProps.settings).map(key => {
    //   if (
    //     !this.isDirty() &&
    //     nextProps.settings[key] !== this.state.settings[key]
    //   ) {
    //     console.log(`${key} = ${nextProps.settings[key]}`)
    //     newSettings[key] = nextProps.settings[key]
    //   }
    // })

    // if (Object.keys(newSettings).length > 0) {
    //   this.setState(newSettings)
    // }
  }


  isDirty () {
    return _.isEqual(this.state.settings, this.props.settings)
  }

  handleCancelPressed () {
    hashHistory.pop();
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

  handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    var settings = this.state.settings
    var keys = name.split(".")
    var parent = this.state.settings

    while (keys.length > 1) {
      var key = keys.shift()
      parent = parent[key];
    }

    if (keys.length != 1) {
      throw new Error("Unknown input name or key state; " + name)
    }

    // There should be one key remaining
    parent[keys[0]] = value

    this.forceUpdate()
  }

  onNotifyValidationError = (name) => {
    var validationErrors = this.state.validationErrors;

    validationErrors[name] = true

    this.setState({
      validationErrors: validationErrors
    })
  }

  onNotifyValidationsPassed = (name) => {
    var validationErrors = this.state.validationErrors;
    
    validationErrors[name] = false

    this.setState({
      validationErrors: validationErrors
    })
  }

  validateChange = (e, validations) => {
    var name = e.target.name
    var value = e.target.value
  
    const validation = validations[name]
  
    if (validation) {
      let isValid = true
    
      if (!validation.canBeBlank && value == '') {
        isValid = false
      }
    
      if (validation.allowedChars && !value.match(validation.allowedChars)) {
        isValid = false
      }
    
      if (validation.format && !value.match(validation.format)) {
        isValid = false
      }

      // If we at least have a value, check to see if it has a min/max
      if (value != "") {
        value = parseInt(value, 10)

        if (validation.min && (value < validation.min || isNaN(value))) {
          isValid = false     
        }

        if (validation.max && value > validation.max) {
          isValid = false
        }
      }

      if (isValid) {
        this.onNotifyValidationsPassed(e.target.name)
      } else {
        this.onNotifyValidationError(e.target.name)
      }
    }

    this.handleInputChange(e)
  }

  invalidConfig = () => {
    let hasValidationErrors = false
    for (let key of Object.keys(this.state.validationErrors)) {
      hasValidationErrors =
        hasValidationErrors || this.state.validationErrors[key]
    }
    return hasValidationErrors
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
          <Tabs.TabHeader>
            <Tabs.TabList className={Styles.ConfigTabs}>
              {this._renderConfigTabs()}
            </Tabs.TabList>
            <Tabs.TabActions>
              <button className="btn btn-primary" onClick={hashHistory.goBack}>
                <Icon glyph={EjectIcon} size={18} />

                CANCEL
              </button>
              <button
                className="btn btn-primary"
                onClick={this._startTestRpc}
                disabled={
                  this.state.isStartDisabled ||
                  portIsBlocked ||
                  this.invalidConfig()
                }
              >
                <Icon glyph={RestartIcon} size={18} />

                { 'RESTART '}
              </button>
            </Tabs.TabActions>
          </Tabs.TabHeader>

          <Tabs.TabPanels className={Styles.ConfigCard}>
            <Tabs.TabPanel>
              <ServerScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <AccountsScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <GasScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <MnemonicScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <LoggingScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <ForkingScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}sed={this.onNotifyValidationsPassed}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <GanacheScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}
              />
            </Tabs.TabPanel>
          </Tabs.TabPanels>
        </Tabs>
      </main>
    )
  }
}

export default SettingsProvider(TestRPCProvider(ConfigScreen))
