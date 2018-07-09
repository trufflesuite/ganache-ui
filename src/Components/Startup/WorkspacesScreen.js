import React, { Component } from 'react'
const { app } = require('electron').remote

import { hashHistory } from 'react-router'
import * as pkg from '../../../package.json'

import connect from '../Helpers/connect'
import * as Core from '../../Actions/Core'

import OnlyIf from '../../Elements/OnlyIf'
import BugModal from '../AppShell/BugModal'

class WorkspacesScreen extends Component {
  constructor () {
    super()
  }

  render () {
    return (
      <div className="WorkspacesScreenContainer">
        <div className="WorkspacesScreen">
          <button>
            Instachain
          </button>
        </div>
      </div>
    )
  }
}

export default connect(WorkspacesScreen, "settings", "core", "logs")
