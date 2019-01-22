import React, { Component } from "react";

import OnlyIf from "../../../components/only-if/OnlyIf";
import StyledSelect from "../../../components/styled-select/StyledSelect";

const VALIDATIONS = {
  "workspace.server.hostname": {
    format: /(^localhost$)|(^\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b$)/,
  },
  "workspace.server.port": {
    allowedChars: /^\d*$/,
    min: 1025,
    max: 65535,
  },
  "workspace.server.network_id": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
  },
  "workspace.server.blockTime": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 200,
  },
};

class ServerScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      automine:
        typeof props.config.settings.workspace.server.blockTime == "undefined",
    };
  }

  toggleAutomine = () => {
    var newValue = !this.state.automine;

    // Remove blockTime value if we turn automine on
    if (newValue === true) {
      delete this.props.config.settings.workspace.server.blockTime;

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "workspace.server.blockTime",
          value: undefined,
        },
      });
    } else if (newValue === false) {
      this.validateChange({
        target: {
          name: "workspace.server.blockTime",
          value: "30",
          attributes: {
            "data-type": "number",
          },
        },
      });
    }

    this.setState({
      automine: !this.state.automine,
    });
  };

  cleanNumber(value) {
    if (isNaN(value) || value === null || value === undefined) {
      return "";
    } else {
      return value;
    }
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS);
    this.forceUpdate();
  };

  render() {
    // const ganachePortStatus = { status: "clear" };
    // const portIsBlocked = false;
    // const { ganachePortStatus } = this.props.testRpcState
    // const portIsBlocked =
    //   ganachePortStatus.status === 'blocked' &&
    //   ganachePortStatus.pid !== undefined &&
    //   !ganachePortStatus.pid[0].name.toLowerCase().includes('ganache') &&
    //   !ganachePortStatus.pid[0].name.toLowerCase().includes('electron')

    return (
      <div>
        <h2>SERVER</h2>

        <section>
          <h4>HOSTNAME</h4>
          <div className="Row">
            <div className="RowItem">
              <StyledSelect
                name="workspace.server.hostname"
                defaultValue={
                  this.props.config.settings.workspace.server.hostname
                }
                changeFunction={this.validateChange}
              >
                <option key="0.0.0.0" value="0.0.0.0">
                  0.0.0.0 - All Interfaces
                </option>
                {Object.keys(this.props.network.interfaces).map(key => {
                  return this.props.network.interfaces[key].map(instance => {
                    if (instance.family.toLowerCase() === "ipv4") {
                      return (
                        <option key={instance.address} value={instance.address}>
                          {instance.address} - {key}
                        </option>
                      );
                    }
                  });
                })}
              </StyledSelect>
              {this.props.validationErrors["workspace.server.hostname"] && (
                <p className="ValidationError">
                  Must be a valid IP address or "localhost"
                </p>
              )}
              {!("workspace.server.hostname" in this.props.validationErrors) &&
                this.props.config.validationErrors[
                  "workspace.server.hostname"
                ] && (
                  <p className="ValidationError">
                    {
                      this.props.config.validationErrors[
                        "workspace.server.hostname"
                      ]
                    }
                  </p>
                )}
            </div>
            <div className="RowItem">
              <p>
                The server will accept RPC connections on the following host and
                port.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>PORT NUMBER</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.server.port"
                type="text"
                data-type="number"
                value={this.cleanNumber(
                  this.props.config.settings.workspace.server.port,
                )}
                onChange={e => {
                  // this.props.appCheckPort(e.target.value)
                  this.validateChange(e);
                }}
              />

              {this.props.validationErrors["workspace.server.port"] && (
                <p className="ValidationError">
                  Must be &gt; 1000 and &lt; 65535.
                </p>
              )}
              {this.props.config.validationErrors["workspace.server.port"] && (
                <p className="ValidationError">
                  {this.props.config.validationErrors["workspace.server.port"]}
                </p>
              )}
            </div>
            <div className="RowItem">
              <p>&nbsp;</p>
            </div>
          </div>
        </section>

        <section>
          <h4>NETWORK ID</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.server.network_id"
                type="text"
                data-type="number"
                value={this.cleanNumber(
                  this.props.config.settings.workspace.server.network_id,
                )}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["workspace.server.network_id"] && (
                <p className="ValidationError">Must be &gt; 1</p>
              )}
            </div>
            <div className="RowItem">
              <p>Internal blockchain identifier of Ganache server.</p>
            </div>
          </div>
        </section>

        <section>
          <h4>AUTOMINE</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="automine"
                  id="Automine"
                  onChange={this.toggleAutomine}
                  checked={this.state.automine}
                />
                <label htmlFor="Automine">AUTOMINE ENABLED</label>
              </div>
            </div>
            <div className="RowItem">
              <p>Process transactions instantaneously.</p>
            </div>
          </div>
        </section>

        <OnlyIf test={!this.state.automine}>
          <section>
            <h4>MINING BLOCK TIME (SECONDS)</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.blockTime"
                  type="text"
                  data-type="number"
                  value={this.cleanNumber(
                    this.props.config.settings.workspace.server.blockTime,
                  )}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors["workspace.server.blockTime"] && (
                  <p className="ValidationError">
                    Must be an integer &gt; 1 and &lt; 200
                  </p>
                )}
              </div>
              <div className="RowItem">
                <p>
                  The number of seconds to wait between mining new blocks and
                  transactions.
                </p>
              </div>
            </div>
          </section>
        </OnlyIf>

        <OnlyIf test={this.state.automine}>
          <section>
            <h4>ERROR ON TRANSACTION FAILURE</h4>
            <div className="Row">
              <div className="RowItem">
                <div className="Switch">
                  <input
                    type="checkbox"
                    name="workspace.server.vmErrorsOnRPCResponse"
                    id="workspace.server.vmErrorsOnRPCResponse"
                    defaultChecked={
                      this.props.config.settings.workspace.server
                        .vmErrorsOnRPCResponse
                    }
                    onChange={this.props.handleInputChange}
                  />
                  <label htmlFor="workspace.server.vmErrorsOnRPCResponse">
                    ENABLED
                  </label>
                </div>
              </div>
              <div className="RowItem">
                <p>
                  When transactions fail, throw an error. If disabled,
                  transaction failures will only be detectable via the "status"
                  flag in the transaction receipt. Disabling this feature will
                  make Ganache handle transaction failures like other Ethereum
                  clients.
                </p>
              </div>
            </div>
          </section>
        </OnlyIf>
      </div>
    );
  }
}

export default ServerScreen;
