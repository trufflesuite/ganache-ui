import React, { Component } from 'react'
import InputText from '../../Elements/InputText'
import LogContainer from './LogContainer'

import connect from '../Helpers/connect'

class Logs extends Component {
  constructor () {
    super()
  }

  render () {
    return (
      <div className="LogsScreen">
      <button className="ClearLogs" onClick={() => {document.getElementsByClassName("LogContainer")[0].getElementsByTagName("ul")[0].innerHTML = "";}}>
      Clear Logs
    </button>
        <main>
          <LogContainer />
        </main>
      </div>
    )
  }
}

export default Logs
