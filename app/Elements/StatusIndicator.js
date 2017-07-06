import React, { Component } from 'react'

import OnlyIf from 'Elements/OnlyIf'

import Styles from './StatusIndicator.css'

export default class StatusIndicator extends Component {
  render () {
    return (
      <div className={Styles.StatusIndicator}>
        <div className={Styles.Metric}>
          <h4>{this.props.title}</h4>
          <span>{this.props.value}</span>
        </div>
        <OnlyIf test={this.props.children}>
          <div className={Styles.Indicator}>
            {this.props.children}
          </div>
        </OnlyIf>
      </div>
    )
  }
}
