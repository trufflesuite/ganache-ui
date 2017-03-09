import React, { Component } from 'react'
import InputText from 'react-input-text'
import Styles from './Repl.css'

export default class Repl extends Component {
  _handleReplInput = (value) => {
    this.props.appServices.repl.sendReplInput(value)
  }

  _handleChange = (value) => { }

  render () {
    return (
      <div className={Styles.Repl}>
        <h4>REPL</h4>
        <main>
          <pre>
            {this.props.appServices.repl.getReplContents()}
          </pre>
        </main>
        <footer>
          <InputText
            onEnter={this._handleReplInput}
            onChange={this._handleChange}
          />
        </footer>
      </div>
    )
  }
}
