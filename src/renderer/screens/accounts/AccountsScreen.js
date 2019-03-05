import React, { Component } from "react";

import connect from "../helpers/connect";

import MnemonicAndHdPath from "./MnemonicAndHdPath";
import AccountList from "./AccountList";

class AccountsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="AccountsScreen">
        <main>
          <div className="Mnemonic">
            <MnemonicAndHdPath
              mnemonic={this.props.core.mnemonic}
              hdPath={this.props.core.hdPath}
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
  "core",
  "accounts",
);
