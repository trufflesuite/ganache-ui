import React, { Component } from "react";
import Web3 from "web3";

export default class ChecksumAddress extends Component {
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

  render() {
    return <span>{this.toChecksumAddress(this.props.address)}</span>;
  }
}
