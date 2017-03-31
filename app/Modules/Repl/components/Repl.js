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
      currentLine: '',
      commandHistory: [],
      commandHistoryIndex: 0
    }
  }

  _handleReplInput = (value) => {
    this.props.appSendReplCommand(value)
    this.setState({currentLine: '', commandHistory: this.state.commandHistory.concat(value)})
  }

  _handleChange = (value) => {
    this.setState({currentLine: value})
  }

  _handleKeyDown = (e) => {
    const keyCode = e.keyCode

    if (keyCode === 38) {
      e.preventDefault()
      this._goForwardInCommandHistory()
    } else if (keyCode === 40) {
      e.preventDefault()
      this._goBackwardsInCommandHistory()
    }
  }

  _goForwardInCommandHistory = () => {
    if (this.state.commandHistoryIndex < this.state.commandHistory.length) {
      this.setState({
        currentLine: this.state.commandHistory[this.state.commandHistoryIndex],
        commandHistoryIndex: this.state.commandHistoryIndex + 1
      })
    }
  }

  _goBackwardsInCommandHistory = () => {
    if (this.state.commandHistoryIndex > 0) {
      this.setState({
        currentLine: this.state.commandHistory[this.state.commandHistoryIndex - 1],
        commandHistoryIndex: this.state.commandHistoryIndex - 1
      })
    }
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
            onKeyDown={this._handleKeyDown}
            placeholder={'$'}
          />
        </footer>
      </div>
    )
  }
}

export default ReplProvider(Repl)
