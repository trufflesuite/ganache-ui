import React, { Component } from 'react'
const { app } = require('electron').remote

import { hashHistory } from 'react-router'

import connect from 'Components/Helpers/connect'

import OnlyIf from 'Elements/OnlyIf'
import GanacheLogo from 'Resources/logo.png'

import Styles from './AppUpdateScreen.css'

class AppUpdateScreen extends Component {
  constructor () {
    super()
    this.state = {
      version: '0.0.1',
      loadingScreenFinished: false,
      timeoutStarted: false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.core.started !== true) {
      return
    }

    // Ensure we have full props
    if (typeof nextProps.settings.firstRun != "undefined" && this.state.timeoutStarted == false) {
      this.setState({timeoutStarted: true}, function() {
        setTimeout(() => {
          if (nextProps.settings.firstRun) {
            hashHistory.push('/first_run')
          } else {
            hashHistory.push('/accounts')
          }
        }, 1000)
      })
    }
  }

  render () {
    const styles = `${Styles.LoadingScreen} ${this.state.loadingScreenFinished
      ? Styles.FadeOutLoadingScreen
      : ''}`

    const elementStyles = className =>
      `${className} ${this.state.loadingScreenFinished
        ? Styles.FadeOutElement
        : ''}`

    return (
      <div className={styles}>
        <div className={Styles.Wrapper}>
          <div className={elementStyles(Styles.Logo)}>
            <img src={GanacheLogo} width={'128px'} height={'128px'} />
          </div>
          <h4 className={elementStyles('')}>
            <strong>
              GANACHE
            </strong>
            <div className={elementStyles(Styles.GanacheVersion)}>
              v{this.state.version}
            </div>
          </h4>
        </div>
      </div>
    )
  }
}

export default connect(AppUpdateScreen, "settings", "core")
