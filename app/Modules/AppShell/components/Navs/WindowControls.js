import React, { PureComponent } from 'react'
import {remote as Remote} from 'electron'

import Styles from './WindowControls.css'

class WindowControls extends PureComponent {

  _handleMinClick = (e) => {
    Remote.getCurrentWindow().minimize()
  }

  _handleMaxClick = (e) => {
    const window = Remote.getCurrentWindow()
    if (!window.isMaximized()) {
      window.maximize()
    } else {
      window.unmaximize()
    }
  }

  _handleCloseClick = (e) => {
    Remote.getCurrentWindow().close()
  }

  render () {
    const className = `${Styles.titleBarBtns} ${this.props.className ? this.props.className : ''}`
    return (
      <div className={className}>
        <span
          className={Styles.titleBarBtnClose}
          onClick={this._handleCloseClick}
        >x</span>
        <span
          className={Styles.titleBarBtnMin}
          onClick={this._handleMinClick}
        >-</span>
        <span
          className={Styles.titleBarBtnMax}
          onClick={this._handleMaxClick}
        >+</span>
      </div>
    )
  }
}

export default WindowControls
