import React, { PureComponent } from "react";

import ChecksumAddress from "../../components/checksum-addresses/ChecksumAddress";
import Modal from "../../components/modal/Modal";

import KeyIcon from "../../icons/key.svg";

export default class KeyModal extends PureComponent {
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
            <dd>{this.props.privateKey}</dd>
          </dl>
          <footer>
            <button onClick={this.props.onCloseModal}>DONE</button>
          </footer>
        </section>
      </Modal>
    );
  }
}
