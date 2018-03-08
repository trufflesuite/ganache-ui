import React, { Component } from 'react'
import app from '../../Kernel/app'

import { hashHistory } from 'react-router'
import * as pkg from '../../../package.json'

import connect from '../Helpers/connect'
import * as Core from '../../Actions/Core'

import OnlyIf from '../../Elements/OnlyIf'
import BugModal from '../AppShell/BugModal'

class TitleScreen extends Component {
  constructor () {
    super()
    this.state = {
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
    return (
      <div className="TitleScreenContainer">
        <div className="TitleScreen">
          <div className="LogoWrapper">
            <div className="Logo FadeInElement"/>
          </div>
          <h4>
            <strong>
              Ganache
            </strong>
            <div className="GanacheVersion">
              v{app.getVersion()}
            </div>
          </h4>
        </div>
        <OnlyIf test={this.props.core.systemError != null}>
          <BugModal systemError={this.props.core.systemError} logs={this.props.logs} />
        </OnlyIf>
      </div>
    )
  }
}

export default connect(TitleScreen, "settings", "core", "logs")
