import React, { Component } from 'react'

import LandingNav from './LandingNav'
import RunningRpcNav from './RunningRpcNav'

export default class DynamicNavSwitcher extends Component {
  render () {
    if (!this.props.currentPath) {
      return <LandingNav {...this.props} />
    }

    switch (this.props.currentPath) {
      case (this.props.currentPath.match(/\/app$/) || {}).input:
        return <LandingNav {...this.props} />
      case (this.props.currentPath.match(/\/app\/vault\/\d+/) || {}).input:
        return <RunningRpcNav {...this.props} />
      default:
        return <LandingNav {...this.props} />
    }
  }
}
