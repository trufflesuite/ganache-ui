import React, {Component} from 'react'

import Styles from './ConfigScreen.css'

export default class ConfigScreen extends Component {
  state = {
    useSpecificTime: false,
    enableVmOpcodeDebugLogging: false,
    specifyMnemonic: false,
    accountsLocks: false,
    forkChain: false
  }

  render () {
    return (
      <div className={Styles.ConfigScreen}>
        <header>
          <h3>TESTRPC CONFIG OPTIONS</h3>
        </header>
        <section>
          <form>
            <div>
              <label>TESTRPC PORT NUMBER</label>
              <input type="text" defaultValue="8545"/>
            </div>
            <div>
              <h4>USE SPECIFIC TIME</h4>
              <div className="Switch">
                <input type="checkbox" id="SpecificTime"/>
                <label htmlFor="SpecificTime">USE SPECIFIC TIME</label>
              </div>
              { this.state.useSpecificTime
                ? <input type="text" />
                : null }
            </div>
            <div>
              <h4>ENABLE VM OPCODE DEBUG LOGGING</h4>
              <div className="Switch">
                <input type="checkbox" id="OpcodeDebug"/>
                <label htmlFor="OpcodeDebug">ENABLE VM OPCODE DEBUG LOGGING</label>
              </div>
            </div>
            <div>
              <h4>USE SPECIFIC TIME</h4>
              <div className="Switch">
                <input type="checkbox" id="Mnemonic" />
                <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
              </div>
              { this.state.specifyMnemonic
                ? <input type="text" />
                : null }
            </div>
            <div>
              <label>TOTAL ACCOUNTS TO GENERATE</label>
              <input type="text" />
            </div>
            <div>
              <label>ACCOUNTS LOCKED</label>
              <div className="Switch">
                <input type="checkbox" id="AccountsLocked"/>
                <label htmlFor="AccountsLocked">ACCOUNTS LOCKED</label>
              </div>
            </div>
            <div>
              <h4>FORK CHAIN</h4>
              <div className="Switch">
                <input type="checkbox" id="ForkChain"/>
                <label htmlFor="ForkChain">FORK CHAIN</label>
              </div>
              { this.state.forkChain
                  ? <input type="text" />
                  : null }
            </div>
          </form>
        </section>
      </div>
    )
  }
}
