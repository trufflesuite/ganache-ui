import React, { Component } from "react";

import connect from "../../../../../renderer/screens/helpers/connect";

import AccountsBanner from "./AccountsBanner";
import AccountList from "./AccountList";

class AccountsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="FilecoinAccountsScreen">
        <main>
          <div className="Mnemonic">
            <AccountsBanner
              seed={this.props.core.seed}
            />
          </div>
          <AccountList
            accounts={this.props.accounts.addresses}
            balances={this.props.accounts.balances}
            nonces={this.props.accounts.nonces}
            privateKeys={this.props.core.privateKeys}
          />
        </main>
      </div>
    );
  }
}

export default connect(
  AccountsScreen,
  ["filecoin.core", "core"],
  ["filecoin.accounts", "accounts"]
);
