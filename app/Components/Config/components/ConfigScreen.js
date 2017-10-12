import React, { PureComponent } from 'react'
import { hashHistory } from 'react-router'
import _ from 'lodash'
import connect from 'Components/Helpers/connect'

import * as Core from 'Actions/Core'
import * as Settings from 'Actions/Settings'

import Icon from 'Elements/Icon'
import OnlyIf from 'Elements/OnlyIf'

import Tabs from './Tabs/Tabs'

import ServerScreen from './ConfigScreens/ServerScreen'
import AccountsScreen from './ConfigScreens/AccountsScreen'
import ChainScreen from './ConfigScreens/ChainScreen'
import AdvancedScreen from './ConfigScreens/AdvancedScreen'

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

  restartServer = () => {
    if (this.isDirty()) {
      this.props.dispatch(Settings.requestSaveSettings(this.state.settings))
    }
    this.props.dispatch(Core.requestServerRestart())
  }

  isDirty () {
    return _.isEqual(this.state.settings, this.props.settings) == false
  }

  handleCancelPressed () {
    hashHistory.pop();
  }

  _renderConfigTabs = () => {
    return [
      'Server',
      'Accounts & Keys',
      'Chain',
      'Advanced'
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
    const name = target.name
    let value = target.value

    switch (target.type) {
      case "number":
        value = parseInt(target.value)
        break
      case "checkbox":
        value = target.checked
        break;
    }

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
    // Only save the value if the text box or input value is non-zero/non-blank.
    // Otherwise remove the key.
    if (value && value != "" && value != 0) {
      parent[keys[0]] = value
    } else {
      delete parent[keys[0]]
    }

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
                onClick={this.restartServer}
                disabled={this.invalidConfig()}
              >
                <Icon glyph={RestartIcon} size={18} />
                { this.isDirty() ? 'SAVE AND RESTART' : 'RESTART' }
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
              <ChainScreen
                settings={this.state.settings}
                handleInputChange={this.handleInputChange}
                validateChange={this.validateChange}
                validationErrors={this.state.validationErrors}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel>
              <AdvancedScreen
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

export default connect(ConfigScreen, "settings")
