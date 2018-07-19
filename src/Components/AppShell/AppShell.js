import React, { Component } from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

import connect from '../Helpers/connect'
import * as AppShellActions from '../../Actions/AppShell'

import TopNavbar from './TopNavbar'
import OnlyIf from '../../Elements/OnlyIf'
import BugModal from './BugModal'
import UpdateModal from '../AutoUpdate/UpdateModal'
import ElectronCookies from '@exponent/electron-cookies'

ElectronCookies.enable({
  origin: 'http://truffleframework.com/ganache'
})

class AppShell extends Component {
  constructor (props) {
    super(props)
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
    return (
      <div className="AppShell">
        <TopNavbar {...this.props} />

        <div className="ShellContainer" ref="shellcontainer">
          <Scrollbars
            className="scrollBar">
            {this.props.children}
          </Scrollbars>
        </div>
        <OnlyIf test={this.props.core.systemError != null && this.props.core.showBugModal}>
          <BugModal systemError={this.props.core.systemError} logs={this.props.logs} />
        </OnlyIf>
        <OnlyIf test={!this.props.core.systemError && this.props.autoUpdate.showModal}>
          <UpdateModal />
        </OnlyIf>
      </div>
    )
  }
}

export default connect(AppShell, "core", "config", "logs", "autoUpdate");
