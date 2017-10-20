import React, { PureComponent } from 'react'

import ChecksumAddress from '../../Elements/ChecksumAddress'
import KeyIcon from '../../Elements/icons/key.svg'
import Modal from '../../Elements/Modal'

export default class KeyModal extends PureComponent {
  render () {
    return (
      <Modal className="KeyModal">
        <header>
          <h4>
            <ChecksumAddress address={this.props.accountAddress} />
          </h4>
        </header>

        <section>
          <dl>
            <dt><KeyIcon /> PRIVATE KEY</dt>
            <dd>
              {this.props.privateKey}
            </dd>
          </dl>
          <footer>
            <button onClick={this.props.onCloseModal}>DONE</button>
          </footer>
        </section>
      </Modal>
    )
  }
}
