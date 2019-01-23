import React, { Component } from "react";
import Web3 from "web3";
import { requestCopyToClipboard } from "../../../common/redux/core/actions";

export default class ChecksumAddress extends Component {
  constructor(props) {
    super(props);
    this.address = this.toChecksumAddress(this.props.address);
    this.timeout = null;
    this.state = {
      display: this.address,
    };
  }
  toChecksumAddress = address => {
    address = address.replace("0x", "").toLowerCase();
    const hash = Web3.utils.sha3(address).replace("0x", "");
    let ret = "0x";

    for (let i = 0; i < address.length; i++) {
      if (parseInt(hash[i], 16) >= 8) {
        ret += address[i].toUpperCase();
      } else {
        ret += address[i];
      }
    }

    return ret;
  };

  copy = () => {
    requestCopyToClipboard(this.address);
    this.displayCopyNotice();
  };

  displayCopyNotice = () => {
    this.timeout = setTimeout(() => {
      this.displayAddress();
      this.timeout = null;
    }, 1000);
    this.setState({
      // Lazy fill with spaces to length of an address
      display: "Copied to clipboard!" + "\u00a0".repeat(22),
    });
  };

  displayAddress = () => {
    this.setState({
      display: this.address,
    });
  };

  componentWillUnmount = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  render() {
    return (
      <span
        className={`ChecksumAddress ${this.props.className || ""}`}
        onClick={this.copy}
      >
        {this.state.display}
      </span>
    );
  }
}
