import React, { Component } from "react";
import StyledSelect from "../../../../../../renderer/components/styled-select/StyledSelect";
import connect from "../../../../../../renderer/screens/helpers/connect";
import { FilecoinOptionsConfig } from "@ganache/filecoin-options";

const VALIDATIONS = {
  "workspace.server.hostname": {
    format: /(^localhost$)|(^\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b$)/,
  },
  "workspace.server.port": {
    allowedChars: /^\d*$/,
    min: 1025,
    max: 65535,
  },
  "workspace.server.chain.ipfsHost": {
    format: /(^localhost$)|(^\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b$)/,
  },
  "workspace.server.chain.ipfsPort": {
    allowedChars: /^\d*$/,
    min: 1025,
    max: 65535,
  },
};

class ServerScreen extends Component {
  constructor(props) {
    super(props);
  }

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
    const hasProviderOptions = Object.keys(this.props.core.options).length > 1;
    const defaults = FilecoinOptionsConfig.normalize({});

    const ipfsPort = this.props.config.settings.workspace.server.chain.ipfsPort || (hasProviderOptions ? this.props.core.options.chain.ipfsPort : defaults.chain.ipfsPort);
    const showLotusPortError = this.props.config.validationErrors["workspace.server.port"] && this.props.config.validationErrors["workspace.server.port"].includes(`${this.props.config.settings.workspace.server.port}`);
    const showIpfsPortError = this.props.config.validationErrors["workspace.server.port"] && this.props.config.validationErrors["workspace.server.port"].includes(`${ipfsPort}`);
    return (
      <div>
        {this.props.config.validationErrors["workspace.server.chain"] && (
          <div>
            <p className="ValidationError">{this.props.config.validationErrors["workspace.server.chain"]}</p>
            <br/>
          </div>
        )}
        <h2>SERVER</h2>

        <section>
          <h4>LOTUS HOSTNAME</h4>
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
                  Must be a valid IP address or &quote;localhost&quote;
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
          <h4>LOTUS PORT NUMBER</h4>
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
              {showLotusPortError && (
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
          <h4>IPFS HOSTNAME</h4>
          <div className="Row">
            <div className="RowItem">
              <StyledSelect
                name="workspace.server.chain.ipfsHost"
                defaultValue={
                  this.props.config.settings.workspace.server.chain.ipfsHost || (hasProviderOptions ? this.props.core.options.chain.ipfsHost : defaults.chain.ipfsHost)
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
              {this.props.validationErrors["workspace.server.chain.ipfsHost"] && (
                <p className="ValidationError">
                  Must be a valid IP address or &quote;localhost&quote;
                </p>
              )}
              {!("workspace.server.chain.ipfsHost" in this.props.validationErrors) &&
                this.props.config.validationErrors[
                  "workspace.server.chain.ipfsHost"
                ] && (
                  <p className="ValidationError">
                    {
                      this.props.config.validationErrors[
                        "workspace.server.chain.ipfsHost"
                      ]
                    }
                  </p>
                )}
            </div>
            <div className="RowItem">
              <p>
                The IPFS server will run its API on the following host and
                port.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>IPFS PORT NUMBER</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.server.chain.ipfsPort"
                type="text"
                data-type="number"
                value={this.cleanNumber(ipfsPort)}
                onChange={e => {
                  // this.props.appCheckPort(e.target.value)
                  this.validateChange(e);
                }}
              />

              {this.props.validationErrors["workspace.server.chain.ipfsPort"] && (
                <p className="ValidationError">
                  Must be &gt; 1000 and &lt; 65535.
                </p>
              )}
              {showIpfsPortError && (
                <p className="ValidationError">
                  {/* purposely reusing workspace.server.port so that the common
                      ErrorHandler doesn't need to know about IPFS */}
                  {this.props.config.validationErrors["workspace.server.port"]}
                </p>
              )}
            </div>
            <div className="RowItem">
              <p>&nbsp;</p>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default connect(
  ServerScreen,
  ["filecoin.core", "core"]
);
