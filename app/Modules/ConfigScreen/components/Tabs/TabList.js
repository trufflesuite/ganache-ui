import React from 'react'

import Styles from './Tabs.css'

const Component = ({ children, activeIndex, onActiveTab, ...rest }) => {
  return (
    <div {...rest}>
      {React.Children.map(children, (child, i) =>
        React.cloneElement(child, {
          active: activeIndex === i,
          onActivate: () => onActiveTab(i)
        })
      )}
    </div>
  )
}

Component.displayName = 'TabList'

export default Component
