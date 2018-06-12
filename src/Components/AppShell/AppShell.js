import React, { Component } from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'
import { shell } from 'electron'
import { Scrollbars } from 'react-custom-scrollbars';

import connect from '../Helpers/connect'
import * as AppShellActions from '../../Actions/AppShell'

import TopNavbar from './TopNavbar'
import OnlyIf from '../../Elements/OnlyIf'
import BugModal from './BugModal'
import UpdateModal from '../AutoUpdate/UpdateModal'
import ElectronCookies from '@exponent/electron-cookies'
import {GoogleAnalytics as GA} from '../../Services/GoogleAnalytics'

const { app } = require('electron').remote

ElectronCookies.enable({
  origin: 'http://truffleframework.com/ganache'
})

class AppShell extends Component {
  constructor (props) {
    super(props)
    this.scrollDedupeTimeout = null

    if (!GA.isSetup) {
      GA.setup(props.settings.googleAnalyticsTracking, props.settings.uuid)
      GA.reportSettings(props.settings)
    }
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

  componentWillReceiveProps (nextProps) {
    // If we're not tracking page use, bail.
    if (nextProps.settings.googleAnalyticsTracking == false) {
      GA.isEnabled = false
      return
    }
    else {
      GA.isEnabled = true
    }

    // If the page hasn't changed, bail.
    if (nextProps.location.pathname == this.props.location.pathname) {
      return
    }

    const segment = nextProps.location.pathname.split('/')[1] || 'dashboard'

    // If we haven't initialized GA, do it.
    if (!GA.isSetup) {
      GA.setup(nextProps.settings.googleAnalyticsTracking, nextProps.settings.uuid)
      GA.reportSettings(nextProps.settings)
    }

    GA.reportPageview(nextProps.location.pathname)
    GA.reportScreenview(segment)
  }

  onCloseFatalErrorModal = () => {}

  render () {
    const path = this.props.location.pathname
    return (
      <div className="AppShell">
        <TopNavbar {...this.props} />

        <div className="ShellContainer" ref="shellcontainer">
          <Scrollbars
            className="scrollBar">
            {this.props.children}
          </Scrollbars>
        </div>
        <OnlyIf test={this.props.core.systemError != null && this.props.core.showModal}>
          <BugModal systemError={this.props.core.systemError} logs={this.props.logs} />
        </OnlyIf>
        <OnlyIf test={!this.props.core.systemError && this.props.autoUpdate.showModal}>
          <UpdateModal />
        </OnlyIf>
      </div>
    )
  }
}

export default connect(AppShell, "core", "settings", "logs", "autoUpdate");
