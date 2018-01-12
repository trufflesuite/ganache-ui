import React, { Component } from 'react'
import InputText from '../../Elements/InputText'
import LogContainer from './LogContainer'
import { clearLogLines } from '../../Actions/Logs'

import connect from '../Helpers/connect'

class Logs extends Component {
  constructor () {
    super()
  }

  clearLogs = () => {
    this.props.dispatch(clearLogLines())
  }

  render () {
    return (
      <div className="LogsScreen">
        <button
          className="ClearLogs"
          onClick={this.clearLogs}>
          Clear Logs
        </button>
        <main>
          <LogContainer />
        </main>
      </div>
    )
  }
}

export default connect(Logs)
