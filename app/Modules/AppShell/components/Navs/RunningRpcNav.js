import React from 'react'
import TestRPCProvider from 'Data/Providers/TestRPCProvider'

import Styles from './RunningRpcNav.css'

class RunningRpcNav extends React.Component {

  componentDidMount () {
    this.props.appGetBlockChainState()
  }

  _handleStopMining = (e) => {
    this.props.appStopMining()
  }

  _handleStartMining = (e) => {
    this.props.appStartMining()
  }

  _handleForceMine = (e) => {
    this.props.appForceMine()
  }

  render () {
    return (
      <nav className={Styles.nav}>
        <header>
          <h1>ZIRCON</h1>
          <span>v0.1</span>
        </header>
        <main className={Styles.main}>
        </main>
        <footer className={Styles.footer}>
          <div>
            <h4>CURRENT BLOCK NUMBER</h4>
            <span>{this.props.testRpcState.blockNumber}</span>
          </div>
          <div>
            <h4>BLOCK INTERVAL TIME</h4>
            <span>{this.props.testRpcState.blocktime} (SEC)</span>
          </div>
          <div>
            <h4>GAS PRICE / LIMIT</h4>
            <span>{this.props.testRpcState.gasPrice} / {this.props.testRpcState.gasLimit}</span>
          </div>
          <div>
            <h4>MINING CONTROLS</h4>
            <button className={Styles.MiningBtn} disabled={!this.props.testRpcState.isMining} onClick={this._handleStopMining}>Stop Mining</button>
            <button className={Styles.MiningBtn} disabled={this.props.testRpcState.isMining} onClick={this._handleStartMining}>Start Mining</button>
            <button className={Styles.MiningBtn} onClick={this._handleForceMine}>Force Mine</button>
            <button className={Styles.MiningBtn}>Increase Time</button>
          </div>
        </footer>
      </nav>
    )
  }

}

export default TestRPCProvider(RunningRpcNav)
