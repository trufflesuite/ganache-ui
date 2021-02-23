import React, { Component } from "react";

import OnlyIf from "../../../../../../renderer/components/only-if/OnlyIf";
import { STARTUP_MODE } from "../../../../../../common/redux/config/actions";
import connect from "../../../../../../renderer/screens/helpers/connect";

const VALIDATIONS = {
  "workspace.server.wallet.totalAccounts": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 100,
  },
  "workspace.server.wallet.defaultBalance": {
    allowedChars: /^[0-9]*\.?[0-9]*$/,
    min: 0,
  },
};

class AccountsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accountsLocked: !!props.config.settings.workspace.server
        .unlocked_accounts,
      autoSeed: props.config.settings.workspace.randomizeSeedOnStart,
    };
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS);
    this.forceUpdate();
  };

  toggleAutoSeed = () => {
    var toggleValue = !this.state.autoSeed;

    // Remove mnemonic if we turn autoSeed on
    this.props.config.settings.workspace.randomizeSeedOnStart = toggleValue;

    this.validateChange({
      target: {
        name: "randomizeSeedOnStart",
        value: toggleValue,
      },
    });

    this.setState({
      autoSeed: toggleValue,
    });
  };

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
        <h2>ACCOUNTS &amp; KEYS</h2>
        <OnlyIf test={!enabled}>
          <div className="Notice">
            <span className="Warning">⚠</span> Accounts can only be updated when
            creating a new workspace.
          </div>
        </OnlyIf>
        <OnlyIf test={enabled}>
          <section>
            <h4>ACCOUNT DEFAULT BALANCE</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.wallet.defaultBalance"
                  type="text"
                  data-type="number"
                  value={this.cleanNumber(
                    this.props.config.settings.workspace.server.wallet.defaultBalance || this.props.core.options.wallet.defaultBalance
                  )}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors[
                  "workspace.server.wallet.defaultBalance"
                ] && (
                  <p className="ValidationError">
                    Must be a valid number that is at least{" "}
                    {VALIDATIONS["workspace.server.wallet.defaultBalance"].min}
                  </p>
                )}
              </div>
              <div className="RowItem">
                <p>The starting balance for accounts, in FIL.</p>
              </div>
            </div>
          </section>
          <section>
            <h4>TOTAL ACCOUNTS TO GENERATE</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.wallet.totalAccounts"
                  type="text"
                  data-type="number"
                  value={this.cleanNumber(
                    this.props.config.settings.workspace.server.wallet.totalAccounts || this.props.core.options.wallet.totalAccounts
                  )}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors[
                  "workspace.server.wallet.totalAccounts"
                ] && (
                  <p className="ValidationError">
                    Must be &gt;{" "}
                    {VALIDATIONS["workspace.server.wallet.totalAccounts"].min} and
                    &lt; {VALIDATIONS["workspace.server.wallet.totalAccounts"].max}
                  </p>
                )}
              </div>
              <div className="RowItem">
                <p>Total number of Accounts to create and pre-fund.</p>
              </div>
            </div>
          </section>
          <section>
            <h4>AUTOGENERATE SEED</h4>
            <div className="Row">
              <div className="RowItem">
                <div className="Switch">
                  <input
                    type="checkbox"
                    name="autoSeed"
                    id="Seed"
                    onChange={this.toggleAutoSeed}
                    checked={this.state.autoSeed}
                  />
                  <label htmlFor="Seed">AUTOGENERATE SEED</label>
                </div>
              </div>
              <div className="RowItem">
                <p>
                  Turn on to automatically generate a new seed and account
                  addresses on each run.
                </p>
              </div>
            </div>
          </section>

          <OnlyIf test={!this.state.autoSeed}>
            <section>
              <div className="Row">
                <div className="RowItem">
                  <input
                    type="text"
                    placeholder="Enter Seed to use"
                    name="workspace.server.wallet.seed"
                    value={
                      this.props.config.settings.workspace.server.wallet.seed || this.props.core.options.wallet.seed
                    }
                    onChange={this.validateChange}
                  />
                </div>
                <div className="RowItem">
                  <p>Enter the Seed you wish to use.</p>
                </div>
              </div>
            </section>
          </OnlyIf>
        </OnlyIf>
      </div>
    );
  }
}

export default connect(
  AccountsScreen,
  ["filecoin.core", "core"]
);
