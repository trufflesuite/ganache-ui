import React, {Component} from 'react'
import Mousetrap from 'mousetrap'
import { hashHistory } from 'react-router'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import WindowControls from './WindowControls'
import TopNavbar from './TopNavbar'

import Styles from './AppShell.css'

class AppShell extends Component {
  componentDidMount () {
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
