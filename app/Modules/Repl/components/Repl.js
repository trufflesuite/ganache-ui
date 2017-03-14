import React, { Component } from 'react'
import InputText from 'Elements/InputText'
import LogContainer from 'Elements/LogContainer'
import Styles from './Repl.css'

import ReplProvider from 'Data/Providers/ReplProvider'

class Repl extends Component {
  constructor () {
    super()

    this.buffer = []
    this.state = {
      currentLine: ''
    }
  }

  _handleReplInput = (value) => {
    this.props.appSendReplCommand(value)
    this.setState({currentLine: ''})
  }

  _handleChange = (value) => {
    this.setState({currentLine: value})
  }

  render () {
    return (
      <div className={Styles.Repl}>
        <h4>REPL</h4>
        <main>
          <LogContainer logs={this.props.repl.replBuffer} />
        </main>
        <footer>
          <InputText
            delay={0}
            value={this.state.currentLine}
            onEnter={this._handleReplInput}
            onChange={this._handleChange}
            placeholder={'> READY'}
          />
        </footer>
      </div>
    )
  }
}

export default ReplProvider(Repl)
