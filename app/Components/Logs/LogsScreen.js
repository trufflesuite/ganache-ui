import React, { Component } from 'react'
import InputText from 'Elements/InputText'
import LogContainer from './LogContainer'
import Styles from './Logs.css'

import connect from 'Components/Helpers/connect'

class Logs extends Component {
  constructor () {
    super()
  }

  render () {
    return (
      <div className={Styles.Logs}>
        <main>
          <LogContainer />
        </main>
      </div>
    )
  }
}

export default Logs
