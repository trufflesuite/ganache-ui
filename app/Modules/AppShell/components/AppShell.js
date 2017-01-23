import React, {Component} from 'react'

import DynamicNavSwitcher from './Navs/DynamicNavSwitcher'

import Styles from './AppShell.css'

export default class AppShell extends Component {
  constructor (props) {
    super(props)

    this.renderClonedChildrenWithPropsAndPathKey = this.renderClonedChildrenWithPropsAndPathKey.bind(this)
  }

  renderClonedChildrenWithPropsAndPathKey (children, props, pathNameKey) {
    return React.Children.map(children, (child) => (
      React.cloneElement(child, {...props, key: pathNameKey})
    ))
  }

  render () {
    const path = this.props.location.pathname
    const segment = path.split('/')[1] || 'dashboard'

    return (
      <div className={Styles.AppShell}>
        <DynamicNavSwitcher currentPath={this.props.location.pathname}/>
        { this.renderClonedChildrenWithPropsAndPathKey(this.props.children, {...this.props}, segment) }
      </div>
    )
  }
}
