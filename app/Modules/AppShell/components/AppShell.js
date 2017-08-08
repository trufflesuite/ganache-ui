import React, { Component } from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'
import SettingsProvider from 'Data/Providers/SettingsProvider'
import ConsoleProvider from 'Data/Providers/ConsoleProvider'

import WindowControls from './WindowControls'
import TopNavbar from './TopNavbar'

import ua from 'universal-analytics'
import ElectronCookies from '@exponent/electron-cookies'

import CSSTransitionGroup from 'react-addons-css-transition-group'

const { app } = require('electron').remote

import Styles from './AppShell.css'

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

    window.onerror = function (msg, url, lineNo, columnNo, error) {
      var message = [
        'Message: ' + msg,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
      ].join(' - ')

      setTimeout(function () {
        // this.user.exception(message.toString())
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
      </div>
    )
  }
}

export default ConsoleProvider(SettingsProvider(TestRPCProvider(AppShell)))
