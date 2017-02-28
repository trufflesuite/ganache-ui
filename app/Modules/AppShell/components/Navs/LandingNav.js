import React, { Component } from 'react'

import Logo from 'Elements/Logo'
import Styles from './LandingNav.css'

class LandingNav extends Component {
  render () {
    return (
      <nav className={Styles.nav}>
        <div className={Styles.nav_left}>
        </div>
        <div className={Styles.nav_center}>
          <Logo />
        </div>
        <div className={Styles.nav_right}>
        </div>
      </nav>
    )
  }
}

export default LandingNav
