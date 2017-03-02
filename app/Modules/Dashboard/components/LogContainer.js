import React, { Component } from 'react'

import Styles from './LogContainer.css'

export default class LogContainer extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.logs.length !== this.props.logs.length
  }

  componentWillUpdate () {
    var node = this.refs.LogItems
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight
  }

  componentDidUpdate () {
    if (this.shouldScrollBottom) {
      this.refs.LogItems.scrollTop = this.refs.LogItems.scrollHeight
    }
  }

  render () {
    return (
      <div className={Styles.LogContainer} ref="LogContainer">
        <ul ref="LogItems">
          {
            this.props.logs.map((log) => {
              return (
                <li key={log.time}>
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
