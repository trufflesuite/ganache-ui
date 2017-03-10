import React, { Component } from 'react'
import InputText from 'Elements/InputText'
import LogContainer from 'Elements/LogContainer'
import Styles from './Repl.css'

export default class Repl extends Component {
  constructor () {
    super()
    console.log('constructin')

    this.buffer = []

    this.state = {
      currentLine: ''
    }
  }

  _buildLogObj = (message, {isCommand = false, isResult = false}={}) => {
    let type = 'plain'

    if (isCommand) {
      type = 'command'
    }

    if (isResult) {
      type = 'result'
    }

    if (message.match(/.*Error:/)) {
      type = 'error'
    }

    let log = { message, type }

    if (type !== 'error' && !isResult) {
      log.time = new Date().toLocaleTimeString()
    }

    return log
  }

  _handleReplInput = (value) => {
    this.props.appServices.repl.sendReplInput(value)
    let log = this._buildLogObj(value + '\n', {isCommand: true})
    this.buffer = this.buffer.concat(log)
    this.setState({currentLine: ''})
  }

  _handleChange = (value) => {
    this.setState({currentLine: value})
  }

  shouldComponentUpdate (nextProps, nextState) {
    const newData = this.props.appServices.repl.getReplContents()

    if (newData) {
      let log = this._buildLogObj(newData, {isResult: true})
      this.buffer = this.buffer.concat(log)
      return true
    }

    return false
  }

  render () {
    return (
      <div className={Styles.Repl}>
        <h4>REPL</h4>
        <main>
          <LogContainer logs={this.buffer} />
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
