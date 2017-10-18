import React, { PureComponent } from 'react'

import Icon from 'Elements/Icon'
import ChecksumAddress from 'Elements/ChecksumAddress'
import KeyIcon from 'Elements/icons/key.svg'

import Styles from './Keys.css'

export default class Keys extends PureComponent {
  render () {
    return (
      <div className={Styles.Modal}>
        <header>
          <h4>
            KEYS OF <ChecksumAddress address={this.props.accountAddress} />
          </h4>
        </header>

        <section>
          <dl>
            <dt><Icon glyph={KeyIcon} size={28} /> PRIVATE KEY</dt>
            <dd>
              {this.props.privateKey}
            </dd>
          </dl>
          <footer>
            <button onClick={this.props.onCloseModal}>DONE</button>
          </footer>
        </section>
      </div>
    )
  }
}
