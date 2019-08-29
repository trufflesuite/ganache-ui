import React, { PureComponent } from "react";

import ChecksumAddress from "../../components/checksum-addresses/ChecksumAddress";
import Modal from "../../components/modal/Modal";

export default class KeyModal extends PureComponent {
  render() {
    return (
      <Modal className="KeyModal">
        <header>
          <h4>ACCOUNT INFORMATION</h4>
        </header>

        <section>
          <dl>
            <dt>ACCOUNT ADDRESS</dt>
            <dd>
              <ChecksumAddress address={this.props.accountAddress} />
            </dd>
          </dl>
          <dl>
            <dt>PRIVATE KEY</dt>
            <dd>
              {this.props.privateKey}
              <br />
              <p className="danger">
                Do not use this private key on a public blockchain; use it for
                development purposes only!
              </p>
            </dd>
          </dl>
          <footer>
            <button onClick={this.props.onCloseModal}>DONE</button>
          </footer>
        </section>
      </Modal>
    );
  }
}
