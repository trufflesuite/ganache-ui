import React from 'react'

import Styles from './Tabs.css'

const Component = ({ children, ...rest }) =>
  <div {...rest}>
    {children}
  </div>

Component.displayName = 'TabPanel'

export default Component
