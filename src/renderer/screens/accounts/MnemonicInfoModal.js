import React, { PureComponent } from "react";

import Modal from "../../components/modal/Modal";

export default class MnemonicInfoModal extends PureComponent {
  render() {
    return (
      <Modal className="MnemonicInfoModal">
        <header>
          <h4>About Your Mnemonic</h4>
        </header>

        <section>
          <p>
            Your mnemonic is a special secret created for you by Ganache. It's
            used to generate the addresses available during development as well
            as sign transactions sent from those addresses.
          </p>
          <p>
            You should only use this mnemonic during development. If you use a
            wallet application configured with this mnemonic, ensure you switch
            to a separate configuration when using that wallet with production
            blockchains.
          </p>
          <p>
            This mnemonic is not secure. You should not trust it to manage
            blockchain assets.
          </p>
          <footer>
            <button onClick={this.props.onCloseModal}>DONE</button>
          </footer>
        </section>
      </Modal>
    );
  }
}
