import React, { Component } from "react";

import OnlyIf from "../../../components/only-if/OnlyIf";
import { STARTUP_MODE } from "../../../../common/redux/config/actions";

const VALIDATIONS = {
  "workspace.server.total_accounts": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 100,
  },
  "workspace.server.default_balance_ether": {
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
      automnemonic: props.config.settings.workspace.randomizeMnemonicOnStart,
    };
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS);
  };

  toggleAccountsLocked = () => {
    var toggleState = !this.state.accountsLocked;
    var total_accounts = this.props.config.settings.workspace.server
      .total_accounts;

    if (toggleState == true) {
      this.props.config.settings.workspace.server.unlocked_accounts = new Array(
        total_accounts,
      );

      for (var i = 0; i < total_accounts; i++) {
        this.props.config.settings.workspace.server.unlocked_accounts[i] = i;
      }
    } else {
      this.props.config.settings.workspace.server.unlocked_accounts = [];
    }

    this.setState({
      accountsLocked: toggleState,
    });
  };

  toggleAutoMnemonic = () => {
    var toggleValue = !this.state.automnemonic;

    // Remove mnemonic if we turn automnemonic on
    this.props.config.settings.workspace.randomizeMnemonicOnStart = toggleValue;

    this.validateChange({
      target: {
        name: "randomizeMnemonicOnStart",
        value: toggleValue,
      },
    });

    this.setState({
      automnemonic: toggleValue,
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
                  name="workspace.server.default_balance_ether"
                  type="text"
                  data-type="number"
                  value={this.cleanNumber(
                    this.props.config.settings.workspace.server
                      .default_balance_ether,
                  )}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors[
                  "workspace.server.default_balance_ether"
                ] && (
                  <p className="ValidationError">
                    Must be a valid number that is at least{" "}
                    {VALIDATIONS["workspace.server.default_balance_ether"].min}
                  </p>
                )}
              </div>
              <div className="RowItem">
                <p>The starting balance for accounts, in Ether.</p>
              </div>
            </div>
          </section>
          <section>
            <h4>TOTAL ACCOUNTS TO GENERATE</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.total_accounts"
                  type="text"
                  data-type="number"
                  value={this.cleanNumber(
                    this.props.config.settings.workspace.server.total_accounts,
                  )}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors[
                  "workspace.server.total_accounts"
                ] && (
                  <p className="ValidationError">
                    Must be &gt;{" "}
                    {VALIDATIONS["workspace.server.total_accounts"].min} and
                    &lt; {VALIDATIONS["workspace.server.total_accounts"].max}
                  </p>
                )}
              </div>
              <div className="RowItem">
                <p>Total number of Accounts to create and pre-fund.</p>
              </div>
            </div>
          </section>
          <section>
            <h4>AUTOGENERATE HD MNEMONIC</h4>
            <div className="Row">
              <div className="RowItem">
                <div className="Switch">
                  <input
                    type="checkbox"
                    name="automnemonic"
                    id="Mnemonic"
                    onChange={this.toggleAutoMnemonic}
                    checked={this.state.automnemonic}
                  />
                  <label htmlFor="Mnemonic">AUTOGENERATE HD MNEMONIC</label>
                </div>
              </div>
              <div className="RowItem">
                <p>
                  Turn on to automatically generate a new mnemonic and account
                  addresses on each run.
                </p>
              </div>
            </div>
          </section>

          <OnlyIf test={!this.state.automnemonic}>
            <section>
              <div className="Row">
                <div className="RowItem">
                  <input
                    type="text"
                    placeholder="Enter Mnemonic to use"
                    name="workspace.server.mnemonic"
                    value={
                      this.props.config.settings.workspace.server.mnemonic || ""
                    }
                    onChange={this.validateChange}
                  />
                  {this.props.validationErrors["workspace.server.mnemonic"] && (
                    <p>
                      Must be at least 12 words long and only contain letters
                    </p>
                  )}
                </div>
                <div className="RowItem">
                  <p>Enter the Mnemonic you wish to use.</p>
                </div>
              </div>
            </section>
          </OnlyIf>

          <section>
            <h4>LOCK ACCOUNTS</h4>
            <div className="Row">
              <div className="RowItem">
                <div className="Switch">
                  <input
                    type="checkbox"
                    name="workspace.server.locked"
                    id="LockAccounts"
                    checked={this.props.config.settings.workspace.server.locked}
                    onChange={this.props.handleInputChange}
                  />
                  <label htmlFor="LockAccounts">LOCK ACCOUNTS</label>
                </div>
              </div>
              <div className="RowItem">
                <p>If enabled, accounts will be locked on startup.</p>
              </div>
            </div>
          </section>
        </OnlyIf>
      </div>
    );
  }
}

export default AccountsScreen;
