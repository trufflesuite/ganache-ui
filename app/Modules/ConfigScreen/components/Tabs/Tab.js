import React from 'react'

import Styles from './Tabs.css'

const Component = ({ children, active, disabled, onActivate, ...rest }) => {
  const className = `${Styles.ConfigTabItem} ${active ? Styles.ActiveTab : ''}`

  return (
    <div onClick={!disabled && onActivate} {...rest} className={className}>
      {children}
    </div>
  )
}

Component.displayName = 'Tab'

export default Component
