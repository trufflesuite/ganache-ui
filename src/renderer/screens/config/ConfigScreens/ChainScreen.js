import React, { Component } from "react";

import OnlyIf from "../../../components/only-if/OnlyIf";
import { STARTUP_MODE } from "../../../../common/redux/config/actions";
import StyledSelect from "../../../components/styled-select/StyledSelect";

const VALIDATIONS = {
  "workspace.server.gasPrice": {
    allowedChars: /^\d*$/,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true,
  },
  "workspace.server.gasLimit": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true,
  },
  "workspace.server.fork_block_number": {
    allowedChars: /^\d*$/,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    canBeBlank: true,
  },
  "workspace.server.hardfork": {
    allowedChars: /^(byzantium|constantinople|petersburg)$/,
    canBeBlank: false,
  },
};

const FORK_URLS = {
  mainnet: "https://mainnet.infura.io/f6194ba837b640bba3db3d29cc658b07",
  ropsten: "https://ropsten.infura.io/f6194ba837b640bba3db3d29cc658b07",
  kovan: "https://kovan.infura.io/f6194ba837b640bba3db3d29cc658b07",
  rinkeby: "https://rinkeby.infura.io/f6194ba837b640bba3db3d29cc658b07",
  gorli: "https://gorli.infura.io/f6194ba837b640bba3db3d29cc658b07",
};

class ChainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      forking: this.props.config.settings.workspace.server.fork != null,
    };
  }

  validateChange(e) {
    this.props.validateChange(e, VALIDATIONS);
  }

  toggleForking() {
    var toggleValue = !this.state.forking;

    // Remove fork if we turn forking off
    if (!toggleValue) {
      delete this.props.config.settings.workspace.server.fork;

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "workspace.server.fork",
          value: null,
        },
      });
    }

    this.setState({
      forking: toggleValue,
    });
  }

  cleanNumber(value) {
    if (isNaN(value) || value === null || value === undefined) {
      return "";
    } else {
      return value;
    }
  }

  render() {
    const enabled =
      this.props.config.settings.workspace.isDefault ||
      this.props.config.startupMode === STARTUP_MODE.NEW_WORKSPACE;
    return (
      <div>
        <h2>GAS</h2>
        <OnlyIf test={!enabled}>
          <div className="Notice">
            <span className="Warning">⚠</span> Gas limits can only be updated
            when creating a new workspace.
          </div>
        </OnlyIf>
        <OnlyIf test={enabled}>
          <section>
            <h4>GAS LIMIT</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.gasLimit"
                  type="text"
                  data-type="number"
                  value={this.cleanNumber(
                    this.props.config.settings.workspace.server.gasLimit,
                  )}
                  onChange={this.validateChange.bind(this)}
                />
                {this.props.validationErrors["workspace.server.gasLimit"] && (
                  <p className="ValidationError">Must be &ge; 1</p>
                )}
              </div>
              <div className="RowItem">
                <p>
                  Maximum amount of gas available to each block and transaction.
                  Leave blank for default.
                </p>
              </div>
            </div>
          </section>
        </OnlyIf>
        <section>
          <h4>GAS PRICE</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.server.gasPrice"
                type="text"
                data-type="number"
                value={this.cleanNumber(
                  this.props.config.settings.workspace.server.gasPrice,
                )}
                onChange={this.validateChange.bind(this)}
              />
              {this.props.validationErrors["workspace.server.gasPrice"] && (
                <p className="ValidationError">Must be &ge; 0</p>
              )}
            </div>
            <div className="RowItem">
              <p>
                The price of each unit of gas, in WEI. Leave blank for default.
              </p>
            </div>
          </div>
        </section>
        <h2>HARDFORK</h2>
        <section>
          <h4>HARDFORK</h4>
          <div className="Row">
            <div className="RowItem">
              <StyledSelect
                name="workspace.server.hardfork"
                defaultValue={
                  this.props.config.settings.workspace.server.hardfork
                }
                changeFunction={this.validateChange.bind(this)}
              >
                <option value="petersburg">Petersburg</option>
                <option value="constantinople">Constantinople</option>
                <option value="byzantium">Byzantium</option>
              </StyledSelect>
            </div>
            <div className="RowItem">
              <p>The hardfork to use. Default is Petersburg.</p>
            </div>
          </div>
        </section>
        <h2>CHAIN FORKING</h2>
        <OnlyIf test={!enabled}>
          <div className="Notice">
            <span className="Warning">⚠</span> Forking can only be updated when creating a new workspace.
          </div>
          <p>
            {
              this.state.forking ? (
                <div>Forking is Enabled: {this.props.config.settings.workspace.server.fork}@{this.props.config.settings.workspace.server.fork_block_number}</div>
              ) : "Forking is Disabled"
            }
          </p>
        </OnlyIf>
        <OnlyIf test={enabled}>
          <section>
            <div className="Row">
              <div className="RowItem">
                <div className="Switch">
                  <input
                    type="checkbox"
                    name="forking"
                    id="ForkChain"
                    onChange={this.toggleForking.bind(this)}
                    checked={this.state.forking}
                  />
                  <label htmlFor="ForkChain">FORK CHAIN</label>
                </div>
              </div>
              <div className="RowItem">
                <p>Fork an existing chain creating a new sandbox with the existing chain&apos;s accounts, contracts, transactions and data.</p>
              </div>
            </div>
          </section>
          <OnlyIf test={this.state.forking}>
          <section>
            <h4>SELECT CHAIN</h4>
            <div className="Row">
              <div className="RowItem">
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.mainnet} 
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork === FORK_URLS.mainnet} 
                      onChange={this.validateChange.bind(this)} 
                    />
                    Main Ethereum Network
                  </label>
                </div>
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.ropsten}
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork === FORK_URLS.ropsten} 
                      onChange={this.validateChange.bind(this)} 
                    />
                    Ropsten
                  </label>
                </div>
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.kovan} 
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork === FORK_URLS.kovan} 
                      onChange={this.validateChange.bind(this)} 
                    />
                    Kovan
                  </label>
                </div>
                <div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.rinkeby} 
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork === FORK_URLS.rinkeby} 
                      onChange={this.validateChange.bind(this)} 
                    />
                    Rinkeby
                  </label>
                </div><div className="Radio">
                  <label>
                    <input type="radio" 
                      value={FORK_URLS.gorli} 
                      name="workspace.server.fork"
                      checked={this.props.config.settings.workspace.server.fork === FORK_URLS.gorli} 
                      onChange={this.validateChange.bind(this)} 
                    />
                    Görli
                  </label>
                </div>
              </div>
              <div className="RowItem">
                <p>Note: Chain forking is an advanced feature and is still in active development. Please let the Truffle team know if you run into any issues.</p>
              </div>
            </div>
            <h4>OR CUSTOM URL</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.fork"
                  type="url"
                  value={this.props.config.settings.workspace.server.fork}
                  onChange={this.validateChange.bind(this)}
                />
              </div>
              <div className="RowItem">
                <p>The URL of the existing chain&apos;s RPC server, e.g., https://beta-mainnet.trufflesuite.com</p>
              </div>
            </div>
            <h4>BLOCK NUMBER</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.fork_block_number"
                  type="number"
                  value={this.props.config.settings.workspace.server.fork_block_number}
                  onChange={this.validateChange.bind(this)}
                />
              </div>
              <div className="RowItem">
                <p>The URL of the block number to fork from, e.g., 56789</p>
              </div>
            </div> 
          </section>
        </OnlyIf>
        </OnlyIf>
      </div>
    );
  }
}

export default ChainScreen;
