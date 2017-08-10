import React, { Component } from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'
import { shell } from 'electron'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'
import ConsoleProvider from 'Data/Providers/ConsoleProvider'

import WindowControls from './WindowControls'
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

      setTimeout(function () {
        this.user.exception(message.toString())
      }, 0)

      return false
    }

    this.user.pageview('/').send()
  }

  componentDidMount () {
    this.props.appGetSettings()

    Mousetrap.bind(['command+1', 'ctrl+1'], () => {
      this.props.testRpcState.testRpcServerRunning
        ? hashHistory.push('/accounts')
        : null
    })

    Mousetrap.bind(['command+2', 'ctrl+2'], () => {
      this.props.testRpcState.testRpcServerRunning
        ? hashHistory.push('/blocks')
        : null
    })

    Mousetrap.bind(['command+3', 'ctrl+3'], () => {
      this.props.testRpcState.testRpcServerRunning
        ? hashHistory.push('/transactions')
        : null
    })

    Mousetrap.bind(['command+4', 'ctrl+4'], () => {
      this.props.testRpcState.testRpcServerRunning
        ? hashHistory.push('/console')
        : null
    })

    Mousetrap.bind(['command+5', 'ctrl+5'], () => {
      this.props.testRpcState.testRpcServerRunning
        ? hashHistory.push('/config')
        : null
    })

    setInterval(this.props.appGetBlockChainState, 1000)
    setInterval(this.props.appGetConsoleMessages, 1500)
  }

  renderClonedChildrenWithPropsAndPathKey = (children, props, pathNameKey) => {
    return React.cloneElement(children, { ...props, key: pathNameKey })
  }

  componentWillReceiveProps (nextProps) {
    if (
      nextProps.settings.googleAnalyticsTracking &&
      nextProps.location.pathname !== this.props.location.pathname
    ) {
      const segment = nextProps.location.pathname.split('/')[1] || 'dashboard'

      if (!this.user) {
        this._setupGoogleAnalytics()
      }

      this.user && this.user.pageview(nextProps.location.pathname).send()
      this.user &&
        this.user.screenview(segment, 'Ganache', app.getVersion()).send()
    }
  }

  onCloseFatalErrorModal = () => {}

  render () {
    const path = this.props.location.pathname
    const segment = path.replace(/^\//g, '').replace(/\//g, '-') || 'root'

    return (
      <div className={Styles.AppShell}>
        <WindowControls />
        <TopNavbar {...this.props} />

        <div className={Styles.ShellContainer}>
          <CSSTransitionGroup
            transitionName="fade"
            transitionEnterTimeout={150}
            transitionLeaveTimeout={150}
          >
            {this.renderClonedChildrenWithPropsAndPathKey(
              this.props.children,
              { ...this.props },
              segment
            )}
          </CSSTransitionGroup>
        </div>

        <OnlyIf test={this.props.testRpcState.systemError !== null}>
          <div className={ModalStyles.Modal}>
            <section>
              <Icon glyph={BugIcon} size={128} />
              <h4>A SYSTEM ERROR HAS OCCURED</h4>
              <p>
                Well, this is embarassing. Something's happened and an error has
                been thrown which means Ganache will need to be restarted.
              </p>
              <p>
                It'd be great if you could raise a Github issue with the above
                contents and a brief description of what you were doing at the
                time, so we can debug it and make sure it never happens again.
              </p>
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
${this.props.testRpcState.systemError}`
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
                    app.quit()
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

export default ConsoleProvider(SettingsProvider(TestRPCProvider(AppShell)))
