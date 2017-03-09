import React, { Component } from 'react'
import InputText from 'Elements/InputText'
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

  _handleReplInput = (value) => {
    this.props.appServices.repl.sendReplInput(value)
    this.buffer = this.buffer.concat('testrpc > ' + value + '\n')
    this.setState({currentLine: ''})
  }

  _handleChange = (value) => {
    this.setState({currentLine: value})
  }

  shouldComponentUpdate (nextProps, nextState) {
    const newData = this.props.appServices.repl.getReplContents()

    if (newData !== '') {
      this.buffer = this.buffer.concat(newData)
      return true
    }

    return false
  }

  render () {
    return (
      <div className={Styles.Repl}>
        <h4>REPL</h4>
        <main>
          <pre>
            {this.buffer}
          </pre>
        </main>
        <footer>
          <InputText
            delay={0}
            value={this.state.currentLine}
            onEnter={this._handleReplInput}
            onChange={this._handleChange}
          />
        </footer>
      </div>
    )
  }
}
