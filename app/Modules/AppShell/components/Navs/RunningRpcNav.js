import React from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import Styles from './LandingNav.css'

class RunningRpcNav extends React.Component {

  render () {
    console.log(this.props)
    return (
      <nav className={Styles.nav}>
        <div className={Styles.nav_left}>
          <p>TRUFFLE SUITE | ZIRCON</p>
        </div>
        <div className={Styles.nav_center}>

        </div>
        <div className={Styles.nav_right}>
          { this.props.testRpcState.testRpcServerRunning ? "TestRPC Running" : "TestRPC Stopped"}
        </div>
      </nav>
    )
  }

}

export default TestRPCProvider(RunningRpcNav)
