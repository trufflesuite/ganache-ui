import React, { Component } from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'
import { shell } from 'electron'

import connect from 'Components/Helpers/connect'
import * as AppShellActions from 'Actions/AppShell'

import TopNavbar from './TopNavbar'
import OnlyIf from 'Elements/OnlyIf'

import Icon from 'Elements/Icon'
import BugIcon from 'Elements/icons/bug.svg'

import ua from 'universal-analytics'
import ElectronCookies from '@exponent/electron-cookies'

import CSSTransitionGroup from 'react-addons-css-transition-group'

const { app } = require('electron').remote

import Styles from './AppShell.css'
import ModalStyles from 'CoreStyles/modals.css'

ElectronCookies.enable({
  origin: 'http://truffleframework.com/ganache'
})

class AppShell extends Component {
  constructor () {
    super()
    this.scrollDedupeTimeout = null
  }

  _setupGoogleAnalytics = () => {
    this.user = ua('UA-83874933-5', this.props.settings.uuid)
    this.user.set('location', 'http://truffleframework.com/ganache')
    this.user.set('checkProtocolTask', null)
    this.user.set('an', 'Ganache')
    this.user.set('av', app.getVersion())
    this.user.set('ua', navigator.userAgent)
    this.user.set('sr', screen.width + 'x' + screen.height)
    this.user.set(
      'vp',
      window.screen.availWidth + 'x' + window.screen.availHeight
    )

    window.onerror = (msg, url, lineNo, columnNo, error) => {
      var message = [
        'Message: ' + msg,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
      ].join(' - ')

      // setTimeout(() => {
      //   this.user.exception(message.toString())
      // }, 0)

      return false
    }

    this.user.pageview('/').send()
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
      return
    }

    // If the page hasn't changed, bail.
    if (nextProps.location.pathname == this.props.location.pathname) {
      return
    }

    const segment = nextProps.location.pathname.split('/')[1] || 'dashboard'

    // If we haven't initialized GA, do it.
    if (!this.user) {
      this._setupGoogleAnalytics()
    }

    if (this.user) {
      this.user.pageview(nextProps.location.pathname).send()
      this.user.screenview(segment, 'Ganache', app.getVersion()).send()
    }
  }

  onCloseFatalErrorModal = () => {}

  render () {
    const path = this.props.location.pathname
    const segment = path.replace(/^\//g, '').replace(/\//g, '-') || 'root'
    let systemError = this.props.core.systemError

    if (systemError) {
      systemError = systemError.stack || systemError
    }

    return (
      <div className={Styles.AppShell}>
        <TopNavbar {...this.props} />

        <div className={Styles.ShellContainer} ref="shellcontainer">
          {this.props.children}
        </div>

        <OnlyIf test={systemError != null}>
          <div className={ModalStyles.Modal}>
            <section className={Styles.Bug}>
              <Icon glyph={BugIcon} size={128} />
              <h4>Uh Oh... That's a bug.</h4>
              <p>
                Ganache encountered an error. Help us fix it by raising a GitHub issue! Mention the following error information when writing your ticket, and please include as much information as possible. Sorry about that! 
              </p>
              <textarea disabled={true} value={systemError} />
              <footer>
                <button
                  onClick={() => {
                    const title = encodeURIComponent(
                      `System Error when running Ganache ${app.getVersion()} on ${process.platform}`
                    )

                    const body = encodeURIComponent(
                      `<!-- Please give us as much detail as you can about what you were doing at the time of the error, and any other relevant information -->

PLATFORM: ${process.platform}
GANACHE VERSION: ${app.getVersion()}

EXCEPTION:
${systemError}`
                    ).replace(/%09/g, '')

                    shell.openExternal(
                      `https://github.com/trufflesuite/ganache/issues/new?title=${title}&body=${body}`
                    )
                  }}
                >
                  Raise Github Issue
                </button>
                <button
                  onClick={() => {
                    app.relaunch()
                    app.exit()
                  }}
                >
                  RELAUNCH
                </button>
              </footer>
            </section>
          </div>
        </OnlyIf>
      </div>
    )
  }
}

export default connect(AppShell, "core", "settings")
