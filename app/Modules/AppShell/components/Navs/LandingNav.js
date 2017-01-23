import React, { Component } from 'react'

import Styles from './LandingNav.css'

class LandingNav extends Component {
  render () {
    return (
      <nav className={Styles.nav}>
        <div className={Styles.nav_left}>
          <h1>TRUFFLE SUITE | ZIRCON</h1>
        </div>
        <div className={Styles.nav_center}>

        </div>
        <div className={Styles.nav_right}>

        </div>
      </nav>
    )
  }
}

export default LandingNav
