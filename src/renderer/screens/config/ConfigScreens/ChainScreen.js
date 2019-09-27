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
  "workspace.server.hardfork": {
    allowedChars: /^(byzantium|constantinople|petersburg)$/,
    canBeBlank: false,
  },
};

class ChainScreen extends Component {
  constructor(props) {
    super(props);
  }

  validateChange(e) {
    this.props.validateChange(e, VALIDATIONS);
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
        
      </div>
    );
  }
}

export default ChainScreen;
