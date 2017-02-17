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

    console.log(this.props)

    return (
      <div className={Styles.AppShell}>
        <DynamicNavSwitcher currentPath={this.props.location.pathname}/>
        <div className={Styles.ShellContainer}>
          { this.renderClonedChildrenWithPropsAndPathKey(this.props.children, {...this.props}, segment) }
        </div>
      </div>
    )
  }
}

export default TestRPCProvider(AppShell)
