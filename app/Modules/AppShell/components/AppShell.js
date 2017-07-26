import React, {Component} from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import SettingsService from 'Services/SettingsService'

import WindowControls from './WindowControls'
import TopNavbar from './TopNavbar'

import ua from 'universal-analytics'
import ElectronCookies from '@exponent/electron-cookies'
const {app} = require('electron').remote

import Styles from './AppShell.css'

ElectronCookies.enable({
  origin: 'http://truffleframework.com/ganache'
})

class AppShell extends Component {
  constructor () {
    super()

    const Settings = new SettingsService()

    this.user = ua('UA-83874933-5', Settings.get('uuid')) // eslint-disable-line
    this.user.set('location', 'http://truffleframework.com/ganache')
    this.user.set('checkProtocolTask', null)
    this.user.set('an', 'Ganache')
    this.user.set('av', app.getVersion())
    this.user.set('ua', navigator.userAgent)
    this.user.set('sr', screen.width + 'x' + screen.height)
    this.user.set('vp', window.screen.availWidth + 'x' + window.screen.availHeight)
  }

  componentDidMount () {
    this.user.pageview('/').send()
    Mousetrap.bind('command+1', () => {
      this.props.testRpcState.testRpcServerRunning ? hashHistory.push('/accounts') : null
    })

    Mousetrap.bind('command+2', () => {
      this.props.testRpcState.testRpcServerRunning ? hashHistory.push('/blocks') : null
    })

    Mousetrap.bind('command+3', () => {
      this.props.testRpcState.testRpcServerRunning ? hashHistory.push('/transactions') : null
    })

    Mousetrap.bind('command+4', () => {
      this.props.testRpcState.testRpcServerRunning ? hashHistory.push('/console') : null
    })

    Mousetrap.bind('command+5', () => {
      this.props.testRpcState.testRpcServerRunning ? hashHistory.push('/config') : null
    })

    setInterval(this.props.appGetBlockChainState, 1000)
  }

  renderClonedChildrenWithPropsAndPathKey = (children, props, pathNameKey) => {
    return React.Children.map(children, child => React.cloneElement(child, {...props, key: pathNameKey}))
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      const segment = nextProps.location.pathname.split('/')[1] || 'dashboard'

      this.user.pageview(nextProps.location.pathname).send()
      this.user.screenview(segment, 'Ganache').send()
    }
  }

  render () {
    const path = this.props.location.pathname
    const segment = path.split('/')[1] || 'dashboard'

    return (
      <div className={Styles.AppShell}>
        <WindowControls />
        <TopNavbar {...this.props} />
        <div className={Styles.ShellContainer}>
          {
            this.renderClonedChildrenWithPropsAndPathKey(this.props.children,
              {...this.props}, segment)
            }
          </div>
        </div>
    )
  }
  }

export default TestRPCProvider(AppShell)
