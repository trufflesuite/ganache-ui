import React, { Component } from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'
import { shell } from 'electron'

import connect from '../Helpers/connect'
import * as AppShellActions from '../../Actions/AppShell'

import TopNavbar from './TopNavbar'
import OnlyIf from '../../Elements/OnlyIf'
import Modal from '../../Elements/Modal'

import BugIcon from '../../Elements/icons/errorant.svg'

import ua from 'universal-analytics'
import ElectronCookies from '@exponent/electron-cookies'

const { app } = require('electron').remote

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

  // grabs the last 500 log lines as a string formatted for inclusion as a github issue
  prepareLogLines () {
    if (this.props.logs.lines) {
      let firstLogTime = this.props.logs.lines[0].time.getTime()
      return this.props.logs.lines
      .slice(-500) 
      .map(v => `T+${v.time.getTime() - firstLogTime}ms: ${v.line}`)
        .join('\n')
    }

    return ''
  }

  // Remove any user-specific paths in exception messages
  sanitizePaths(message) {
    // Prepare our paths so we *always* will get a match no matter
    // path separator (oddly, on Windows, different errors will give
    // us different path separators)
    var appPath = app.getAppPath().replace(/\\/g, "/")

    // I couldn't figure out the regex, so a loop will do.
    while (message.indexOf(appPath) >= 0) {
      message = systemError.replace(appPath, "")
    }

    return message;
  }

  render () {
    const path = this.props.location.pathname
    const segment = path.replace(/^\//g, '').replace(/\//g, '-') || 'root'
    let systemError = this.props.core.systemError
    let logLines = ''
    if (systemError) {
      systemError = systemError.stack || systemError

      // avoid leaking details about the user's environment
      systemError = this.sanitizePaths(systemError)
      logLines = this.sanitizePaths(this.prepareLogLines())
    }

    return (
      <div className="AppShell">
        <TopNavbar {...this.props} />

        <div className="ShellContainer" ref="shellcontainer">
          {this.props.children}
        </div>

        <OnlyIf test={systemError != null}>
          <Modal> 
            <section className="Bug">
              <BugIcon /*size={192}*/ />
              <h4>Uh Oh... That's a bug.</h4>
              <p>
                Ganache encountered an error. Help us fix it by raising a GitHub issue!<br/><br/> Mention the following error information when writing your ticket, and please include as much information as possible. Sorry about that!
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
\`\`\`
${systemError}
\`\`\`

APPLICATION LOG:
\`\`\`
${logLines}
\`\`\``
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
          </Modal>
        </OnlyIf>
      </div>
    )
  }
}

export default connect(AppShell, "core", "settings", "logs")
