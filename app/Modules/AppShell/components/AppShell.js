import React, {Component} from 'react'

import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import DynamicNavSwitcher from './Navs/DynamicNavSwitcher'

import Styles from './AppShell.css'

class AppShell extends Component {
  renderClonedChildrenWithPropsAndPathKey = (children, props, pathNameKey) => {
    return React.Children.map(children, (child) => (
      React.cloneElement(child, {...props, key: pathNameKey})
    ))
  }

  render () {
    const path = this.props.location.pathname
    const segment = path.split('/')[1] || 'dashboard'

    const isConfigScreen = path === '/'

    return (
      <div className={isConfigScreen ? Styles.ConfigShell : Styles.AppShell}>
        <DynamicNavSwitcher currentPath={this.props.location.pathname} {...this.props}/>
        <div className={isConfigScreen ? Styles.ConfigScreen : Styles.ShellContainer}>
          { this.renderClonedChildrenWithPropsAndPathKey(this.props.children, {...this.props}, segment) }
        </div>
      </div>
    )
  }
}

export default TestRPCProvider(AppShell)
