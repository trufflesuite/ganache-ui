import React from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import MnemonicAndHdPath from './MnemonicAndHdPath'

import Spinner from 'Elements/Spinner'

import Styles from './LandingNav.css'

class RunningRpcNav extends React.Component {

  render () {
    console.log(this.props)
    return (
      <header>
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
        <MnemonicAndHdPath
          mnemonic={this.props.testRpcState.mnemonic}
          hdPath={this.props.testRpcState.hdPath}
          blockNumber={this.props.testRpcState.blockNumber}
          blockTime={this.props.testRpcState.blocktime}
          />
      </header>
    )
  }

}

export default TestRPCProvider(RunningRpcNav)
