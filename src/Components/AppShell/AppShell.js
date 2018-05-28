import React, { Component } from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'
import ReactGA from 'react-ga'
import { Scrollbars } from 'react-custom-scrollbars';

import connect from '../Helpers/connect'
import * as AppShellActions from '../../Actions/AppShell'

import TopNavbar from './TopNavbar'
import OnlyIf from '../../Elements/OnlyIf'
import BugModal from './BugModal'
import UpdateModal from '../AutoUpdate/UpdateModal'

import app from '../../Kernel/app'

app.enableCookies()

class AppShell extends Component {
  constructor () {
    super()
    this.scrollDedupeTimeout = null
  }

  _setupGoogleAnalytics = () => {
    ReactGA.initialize('UA-83874933-5', {
      gaOptions: {
        clientId: this.props.settings.uuid
      }
    })
    ReactGA.set({
      location: 'http://truffleframework.com/ganache',
      checkProtocolTask: null,
      an: 'Ganache',
      av: app.getVersion(),
      ua: navigator.userAgent,
      sr: screen.width + 'x' + screen.height,
      vp: window.screen.availWidth + 'x' + window.screen.availHeight
    })

    window.onerror = (msg, url, lineNo, columnNo, error) => {
      var message = [
        'Message: ' + msg,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
      ].join(' - ')

      // setTimeout(() => {
      //   ReactGA.exception({ description: message.toString() })
      // }, 0)

      return false
    }

    ReactGA.pageview('/')
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

  componentWillMount() {
    if (this.props.settings.googleAnalyticsTracking) {
      this._setupGoogleAnalytics()
    }
  }

  componentDidMount() {
    this.refs.shellcontainer.addEventListener('scroll', this._handleScroll);
  }

  componentWillReceiveProps (nextProps) {
    // If we're not tracking page use, bail.
    if (nextProps.settings.googleAnalyticsTracking == false) {
      return
    }

    // Analytics should already be set up during componentWillMount, this covers case where setting is changed
    if (nextProps.settings.googleAnalyticsTracking !== this.props.settings.googleAnalyticsTracking) {
      this._setupGoogleAnalytics()
    }

    // If the page hasn't changed, bail.
    if (nextProps.location.pathname == this.props.location.pathname) {
      return
    }

    const segment = nextProps.location.pathname.split('/')[1] || 'dashboard'

    ReactGA.pageview(nextProps.location.pathname)
    ReactGA.send('screenview', { screenName: segment, appName: 'Ganache', appVersion: app.getVersion() })
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
        <OnlyIf test={this.props.core.systemError != null}>
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
