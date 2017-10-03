import React from 'react'

import Styles from './Tabs.css'

const Component = ({ children }) => {
  return (
    <div className={Styles.ConfigTabAction}>
      {children}
    </div>
  )
}

Component.displayName = 'TabActions'

export default Component
