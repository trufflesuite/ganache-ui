import React, { Component } from 'react'

import Styles from './LogContainer.css'

export default class LogContainer extends Component {
  render () {
    return (
      <div className={Styles.LogContainer}>
        <ul>
          {
            this.props.logs.map((log) => {
              return (
                <li>
                  [{log.time}] {log.message}
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}
