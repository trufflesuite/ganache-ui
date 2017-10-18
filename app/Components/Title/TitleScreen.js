import React, { Component } from 'react'
const { app } = require('electron').remote

import { hashHistory } from 'react-router'

import connect from '../Helpers/connect'
import * as Core from '../../Actions/Core'

import OnlyIf from '../../Elements/OnlyIf'

class TitleScreen extends Component {
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
    const styles = `TitleScreen ${this.state.loadingScreenFinished
      ? "FadeOutLoadingScreen"
      : ''}`

    const elementStyles = className =>
      `${className} ${this.state.loadingScreenFinished
        ? "FadeOutElement"
        : ''}`

    return (
      <div className={styles}>
        <div className="Wrapper">
          <div className="Logo">
            <img src={"/resources/logo.png"} width={'128px'} height={'128px'} />
          </div>
          <h4 className={elementStyles('')}>
            <strong>
              Ganache
            </strong>
            <div className={elementStyles("GanacheVersion")}>
              v{this.state.version}
            </div>
          </h4>
        </div>
      </div>
    )
  }
}

export default connect(TitleScreen, "settings", "core")
