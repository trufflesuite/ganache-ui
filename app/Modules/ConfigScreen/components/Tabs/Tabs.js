import React from 'react'

import Styles from './Tabs.css'

import TabPanels from './TabPanels'
import TabList from './TabList'
import Tab from './Tab'
import TabPanel from './TabPanel'
import TabActions from './TabActions'
import TabHeader from './TabHeader'

const Component = class extends React.Component {
  static displayName = 'Tabs'
  static TabList = TabList
  static Tab = Tab
  static TabPanels = TabPanels
  static TabPanel = TabPanel
  static TabActions = TabActions
  static TabHeader = TabHeader

  state = { activeIndex: 0 }

  render () {
    const children = React.Children.map(this.props.children, child => {
      switch (child.type) {
        case TabPanels:
          return React.cloneElement(child, {
            activeIndex: this.state.activeIndex
          })
        case TabHeader:
          return React.cloneElement(child, {
            activeIndex: this.state.activeIndex,
            onActiveTab: activeIndex => this.setState({ activeIndex })
          })
        default:
          return child
      }
    })

    return (
      <div className={this.props.className}>
        {children}
      </div>
    )
  }
}

export default Component
