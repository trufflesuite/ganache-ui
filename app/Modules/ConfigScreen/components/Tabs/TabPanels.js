import React from 'react'

import Styles from './Tabs.css'

const Component = ({ children, activeIndex, ...rest }) =>
  <form>
    <div {...rest}>
      {children[activeIndex]}
    </div>
  </form>

Component.displayName = 'TabPanels'

export default Component
