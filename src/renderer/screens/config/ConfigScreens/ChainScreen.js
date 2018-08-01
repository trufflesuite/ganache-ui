import React, { Component } from 'react'
import connect from '../../helpers/connect'
import OnlyIf from '../../../Elements/OnlyIf'

const VALIDATIONS = {
  "server.gasPrice": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true
  },
  "server.gasLimit": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true
  }
}

const FORK_URLS = {
  mainnet: "https://mainnet.infura.io/ganache", 
  ropsten: "https://ropsten.infura.io/ganache", 
  kovan: "https://kovan.infura.io/ganache", 
  rinkeby: "https://rinkeby.infura.io/ganache"
}

class ChainScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      forking: this.props.config.settings.workspace.server.fork != null
    }
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS)
  }

  toggleForking = () => {
    var toggleValue = !this.state.forking

     // Remove fork if we turn forking off
     if (toggleValue == false) {
      delete this.props.config.settings.workspace.server.fork

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "server.fork",
          value: ""
        }
      })
    }

    this.setState({
      forking: toggleValue
    })
  }

  render () {
    return (
      <div>
        <h2>GAS</h2>
        <section>
          <h4>GAS LIMIT</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.server.gasLimit"
                type="number"
                value={this.props.config.settings.workspace.server.gasLimit}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.gasLimit"] &&
                <p className="ValidationError">
                  Must be &ge; 1
                </p>}
            </div>
            <div className="RowItem">
              <p>Maximum amount of gas available to each block and transaction. Leave blank for default.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>GAS PRICE</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.server.gasPrice"
                type="number"
                value={this.props.config.settings.workspace.server.gasPrice}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.gasPrice"] &&
                <p className="ValidationError">
                  Must be &ge; 1
                </p>}
            </div>
            <div className="RowItem">
              <p>The price of each unit of gas, in WEI. Leave blank for default.</p>
            </div>
          </div>
        </section>
        {/* <h2>CHAIN FORKING</h2>
        <section>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="forking"
                  id="ForkChain"
                  onChange={this.toggleForking}
                  checked={this.state.forking}
                />
                <label htmlFor="ForkChain">FORK CHAIN</label>
              </div>
            </div>
            <div className="RowItem">
              <p>Fork an existing chain creating a new sandbox with the existing chain's accounts, contracts, transactions and data.</p>
            </div>
          </div>
        </section>
        <OnlyIf test={this.state.forking}>
          <section>
            <h4>SELECT CHAIN (PROVIDED BY INFURA)</h4>
            <div className="Row">
              <div className="RowItem">
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.mainnet} 
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork == FORK_URLS.mainnet} 
                      onChange={this.validateChange} 
                    />
                    Main Ethereum Network
                  </label>
                </div>
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.ropsten}
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork == FORK_URLS.ropsten} 
                      onChange={this.validateChange} 
                    />
                    Ropsten
                  </label>
                </div>
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.kovan} 
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork == FORK_URLS.kovan} 
                      onChange={this.validateChange} 
                    />
                    Kovan
                  </label>
                </div>
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.rinkeby} 
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork == FORK_URLS.rinkeby} 
                      onChange={this.validateChange} 
                    />
                    Rinkeby
                  </label>
                </div>
              </div>
              <div className="RowItem">
                <p>Note: Chain forking is an advanced feature and is still in active development. Please let the Truffle team know if you run into any issues.</p>
              </div>
            </div>
            {/* <h4>OR CUSTOM URL</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.fork"
                  type="text"
                  value={hasCustomURL == true ? this.props.config.settings.workspace.server.fork : ""}
                  onChange={this.validateChange}
                />
              </div>
              <div className="RowItem">
                <p>The URL of the existing chain's RPC server. Eg., https://mainnet.infura.io</p>
              </div>
            </div> 
          </section>
        </OnlyIf> */}
      </div>
    )
  }
}

export default ChainScreen
