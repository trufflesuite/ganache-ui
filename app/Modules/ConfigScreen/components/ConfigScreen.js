import React, {Component} from 'react'

import Styles from './ConfigScreen.css'

export default class ConfigScreen extends Component {
  state = {
    specificTime: false,
    opcodeDebug: false,
    mnemonic: false,
    accountsLocked: false,
    forkChain: false
  }

  handleInputChange = (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    console.log(name, value)
    this.setState({
      [name]: value
    })
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
              <section>
                <label>TESTRPC PORT NUMBER</label>
                <input type="text" name="portNumber" defaultValue="8545"/>
              </section>
            </div>
            <div>
              <section>
                <h4>USE SPECIFIC TIME</h4>
                <div className="Switch">
                  <input type="checkbox" name="specificTime" id="SpecificTime" onChange={this.handleInputChange} />
                  <label htmlFor="SpecificTime">USE SPECIFIC TIME</label>
                </div>
              </section>
              { this.state.specificTime
                ? <section><input type="text" placeholder="Enter Time to use"/></section>
                : null }
            </div>
            <div>
              <section>
                <h4>ENABLE VM OPCODE DEBUG LOGGING</h4>
                <div className="Switch">
                  <input type="checkbox" name="opcodeDebug" id="OpcodeDebug" onChange={this.handleInputChange} />
                  <label htmlFor="OpcodeDebug">ENABLE VM OPCODE DEBUG LOGGING</label>
                </div>
              </section>
            </div>
            <div>
              <section>
                <h4>AUTOGENERATE HD MNEMONIC</h4>
                <div className="Switch">
                  <input type="checkbox" name="mnemonic" id="Mnemonic" onChange={this.handleInputChange} />
                  <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
                </div>
              </section>
              <section>
              { this.state.mnemonic
                ? <span><input ref={(i) => { this.seedData = i }} name="seedDataValue" defaultValue="" type="text" placeholder="Enter Seed Data" /></span>
                : <span><input ref={(i) => { this.mnemonic = i }} name="mnemonicValue" defaultValue="" type="text" placeholder="Enter Mnemonic to use" /></span>
                }
              </section>
            </div>
            <div>
              <section>
                <label>TOTAL ACCOUNTS TO GENERATE</label>
                <input type="text" defaultValue="6" />
              </section>
            </div>
            <div>
              <section>
                <label>ACCOUNTS LOCKED</label>
                <div className="Switch">
                  <input type="checkbox" name="accountsLocked" id="AccountsLocked" onChange={this.handleInputChange} />
                  <label htmlFor="AccountsLocked">ACCOUNTS LOCKED</label>
                </div>
              </section>
            </div>
            <div>
              <section>
                <h4>FORK CHAIN</h4>
                <div className="Switch">
                  <input type="checkbox" name="forkChain" id="ForkChain" onChange={this.handleInputChange} />
                  <label htmlFor="ForkChain">FORK CHAIN</label>
                </div>
              </section>
              { this.state.forkChain
                  ? <section><input type="text" placeholder="URL to target Chain" /></section>
                  : null }
            </div>
            <button className="btn btn-primary">START TESTRPC</button>
          </form>
        </section>
      </div>
    )
  }
}
