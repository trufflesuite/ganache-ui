import React from 'react'

import Styles from './Tabs.css'

const Component = ({ children, activeIndex, ...rest }) =>
  <form>
    <div {...rest}>
      {React.cloneElement(children[activeIndex], { ...rest })}
    </div>
  </form>

Component.displayName = 'TabPanels'

export default Component
