import React, {Component} from 'react'

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
      <div className='AppShell'>
        { this.renderClonedChildrenWithPropsAndPathKey(this.props.children, {...this.props}, segment) }
      </div>
    )
  }
}
