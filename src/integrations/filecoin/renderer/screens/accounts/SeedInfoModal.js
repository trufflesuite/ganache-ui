import React, { PureComponent } from "react";

import Modal from "../../../../../renderer/components/modal/Modal";

export default class SeedInfoModal extends PureComponent {
  render() {
    return (
      <Modal className="FilecoinSeedInfoModal">
        <header>
          <h4>About Your Seed</h4>
        </header>

        <section>
          <p>
            Your seed is used by Ganache to initiate the random number generator.
            The random number generator is used to generate the addresses available
            during development as well as any other randomness.
          </p>
          <p>
            Using the same seed will generate the same accounts and be as close to
            deterministic behavior as possible.
          </p>
          <p>
            Ganache currently doesn&apos;t generate a mnemonic for Filecoin addresses.
          </p>
          <footer>
            <button onClick={this.props.onCloseModal}>DONE</button>
          </footer>
        </section>
      </Modal>
    );
  }
}
