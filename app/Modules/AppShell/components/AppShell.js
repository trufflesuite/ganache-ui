import React, {Component} from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import WindowControls from './WindowControls'
import TopNavbar from './TopNavbar'

import Styles from './AppShell.css'

class AppShell extends Component {
  renderClonedChildrenWithPropsAndPathKey = (children, props, pathNameKey) => {
    return React.Children.map(children, child => React.cloneElement(child, {...props, key: pathNameKey}))
  }

  render () {
    const path = this.props.location.pathname
    const segment = path.split('/')[1] || 'dashboard'

    return (
      <div className={Styles.AppShell}>
        <div className={Styles.ShellContainer}>
          <WindowControls />
          <TopNavbar {...this.props} />
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
