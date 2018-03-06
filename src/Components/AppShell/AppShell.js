import React, { Component } from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'

import connect from '../Helpers/connect'
import * as AppShellActions from '../../Actions/AppShell'

import TopNavbar from './TopNavbar'
import OnlyIf from '../../Elements/OnlyIf'
import BugModal from './BugModal'

class AppShell extends Component {
  constructor () {
    super()
    this.scrollDedupeTimeout = null
  }

  _handleScroll = () => {
    let container = this.refs.shellcontainer
    let scrollPosition = "top";
    const pixelBuffer = 100

    if (container.scrollTop < pixelBuffer) {
      scrollPosition = "top"
    } else if (container.scrollTop + container.clientHeight >= container.scrollHeight - pixelBuffer) {
      scrollPosition = "bottom"
    } else {
      scrollPosition = "middle"
    }

    this.props.dispatch(AppShellActions.setScrollPosition(scrollPosition))
  }

  setScrollTop = (scrollTop) => {
    this.refs.shellcontainer.scrollTop = scrollTop
  }

  componentDidMount() {
    this.refs.shellcontainer.addEventListener('scroll', this._handleScroll);
  }

  onCloseFatalErrorModal = () => {}

  render () {
    const path = this.props.location.pathname
    return (
      <div className="AppShell">
        <TopNavbar {...this.props} />

        <div className="ShellContainer" ref="shellcontainer">
          {this.props.children}
        </div>
        <OnlyIf test={this.props.core.systemError != null}>
          <BugModal systemError={this.props.core.systemError} logs={this.props.logs} />
        </OnlyIf>
      </div>
    )
  }
}

export default connect(AppShell, "core", "settings", "logs");
