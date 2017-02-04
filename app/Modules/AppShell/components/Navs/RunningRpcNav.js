import React from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import Spinner from 'Elements/Spinner'

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
          { this.props.testRpcState.testRpcServerRunning ? <span>TestRPC Running</span> : <span>TestRPC Stopped</span>}
          <Spinner width={20} height={20}/>
        </div>
      </nav>
    )
  }

}

export default TestRPCProvider(RunningRpcNav)
