import React from 'react'

import TabList from './TabList'

import Styles from './Tabs.css'

const Component = ({ children, activeIndex, onActiveTab, ...rest }) =>
  <div {...rest} className={Styles.ConfigHeader}>
    {React.Children.map(children, child => {
      switch (child.type) {
        case TabList:
          return React.cloneElement(child, {
            activeIndex,
            onActiveTab
          })
        default:
          return child
      }
    })}
  </div>

Component.displayName = 'TabHeader'

export default Component
