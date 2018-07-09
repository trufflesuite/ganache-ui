import React, { Component } from 'react'
const { app } = require('electron').remote

import { hashHistory } from 'react-router'
import * as pkg from '../../../package.json'

import connect from '../Helpers/connect'
import * as Core from '../../Actions/Core'

import OnlyIf from '../../Elements/OnlyIf'
import BugModal from '../AppShell/BugModal'

class TitleScreen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      version: pkg.version,
      firstRun: undefined
    }

    const intervalId = setInterval(() => {
      if (this.state.firstRun === true) {
        hashHistory.push('/first_run')
        clearInterval(intervalId)
      }
      else if (this.state.firstRun === false) {
        hashHistory.push('/workspaces')
        clearInterval(intervalId)
      }
    }, 1000)
  }

  componentWillReceiveProps(nextProps) {
    if ("global" in nextProps.settings && "firstRun" in nextProps.settings.global) {
      this.state.firstRun = nextProps.settings.global.firstRun
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
              v{this.state.version}
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
