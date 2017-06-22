import React, {Component} from 'react'

export default class WithEmptyState extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.test !== this.props.test
  }

  render () {
    const EmptyStateComponent = this.props.emptyStateComponent

    if (this.props.test) {
      return <EmptyStateComponent {...this.props} />
    }

    return this.props.children
  }
}
