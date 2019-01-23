import React, { Component } from "react";

import ChecksumAddress from "../../components/checksum-addresses/ChecksumAddress";
import Modal from "../../components/modal/Modal";
import { requestCopyToClipboard } from "../../../common/redux/core/actions";

import KeyIcon from "../../icons/key.svg";

export default class KeyModal extends Component {
  constructor(props) {
    super(props);
    this.timeout = null;
    this.state = {
      display: this.props.privateKey,
    };
  }

  copy = () => {
    requestCopyToClipboard(this.props.privateKey);
    this.displayCopyNotice();
  };

  displayCopyNotice = () => {
    this.timeout = setTimeout(() => {
      this.displayPrivKey();
      this.timeout = null;
    }, 1000);
    this.setState({
      // Lazy fill with spaces to private key length
      display: "Copied to clipboard!" + "\u00a0".repeat(44),
    });
  };

  displayPrivKey = () => {
    this.setState({
      display: this.props.privateKey,
    });
  };

  componentWillUnmount = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };
  render() {
    return (
      <Modal className="KeyModal">
        <header>
          <h4>
            <ChecksumAddress address={this.props.accountAddress} />
          </h4>
        </header>

        <section>
          <dl>
            <dt>
              <KeyIcon /> PRIVATE KEY
            </dt>
            <dd onClick={this.copy}>{this.state.display}</dd>
          </dl>
          <footer>
            <button onClick={this.props.onCloseModal}>DONE</button>
          </footer>
        </section>
      </Modal>
    );
  }
}
