import React, { Component } from "react";

import MnemonicInfoModal from "./MnemonicInfoModal";
import { requestCopyToClipboard } from "../../../common/redux/core/actions";

import OnlyIf from "../../components/only-if/OnlyIf";

export default class MnemonicAndHdPath extends Component {
  constructor(props) {
    super(props);
    this.timeout = null;
    this.state = {
      showWarning: false,
      display: this.props.mnemonic,
    };
  }

  showWarning() {
    this.setState({
      showWarning: true,
    });
  }

  hideWarning() {
    this.setState({
      showWarning: false,
    });
  }

  copy = () => {
    requestCopyToClipboard(this.props.mnemonic);
    this.displayCopyNotice();
  };

  displayCopyNotice = () => {
    this.timeout = setTimeout(() => {
      this.displayMnemonic();
      this.timeout = null;
    }, 1000);
    this.setState({
      display: "Copied to clipboard!",
    });
  };

  displayMnemonic = () => {
    this.setState({
      display: this.props.mnemonic,
    });
  };

  componentWillUnmount = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  render() {
    return (
      <section className="MnemonicAndHdPath">
        <div className="Mnemonic">
          <h4>
            MNEMONIC{" "}
            <span
              className="WarningIndicator"
              onClick={this.showWarning.bind(this)}
            >
              ?
            </span>
          </h4>
          <span onDoubleClick={this.copy}>{this.state.display}</span>
        </div>
        <div className="HDPath">
          <h4>HD PATH</h4>
          <span>{this.props.hdPath}account_index</span>
        </div>
        <OnlyIf test={this.state.showWarning == true}>
          <MnemonicInfoModal onCloseModal={this.hideWarning.bind(this)} />
        </OnlyIf>
      </section>
    );
  }
}
