import React, {Component} from 'react'

export default class WithEmptyState extends Component {
  render () {
    const EmptyStateComponent = this.props.emptyStateComponent

    if (this.props.test) {
      return <EmptyStateComponent {...this.props} />
    }

    return this.props.children
  }
}
