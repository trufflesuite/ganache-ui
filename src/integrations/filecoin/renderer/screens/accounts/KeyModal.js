import React, { PureComponent } from "react";

import Modal from "../../../../../renderer/components/modal/Modal";

export default class KeyModal extends PureComponent {
  render() {
    return (
      <Modal className="FilecoinKeyModal">
        <header>
          <h4>ACCOUNT INFORMATION</h4>
        </header>

        <section>
          <dl>
            <dt>ACCOUNT ADDRESS</dt>
            <dd>
              <span>{this.props.accountAddress}</span>
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
