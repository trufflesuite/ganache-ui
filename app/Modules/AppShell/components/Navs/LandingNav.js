import React, { Component } from 'react'

import {remote as Remote} from 'electron'

import Logo from 'babel!svg-react!../../../../../resources/logo.svg?name=Icon'

import WindowControls from './WindowControls'
import Styles from './LandingNav.css'

class LandingNav extends Component {
  render () {
    return (
      <nav className={Styles.nav}>
        <div className={Styles.nav_left}>
          <WindowControls />
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
