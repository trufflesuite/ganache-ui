import React, { PureComponent } from 'react'

import Icon from 'Elements/Icon'
import ChecksumAddress from 'Elements/ChecksumAddress'
import AccountIcon from 'Elements/icons/account.svg'

import Styles from './Keys.css'

export default class Keys extends PureComponent {
  render () {
    return (
      <div className={Styles.Modal}>
        <section>
          <Icon glyph={AccountIcon} size={128} />
          <h4>
            <ChecksumAddress address={this.props.accountAddress} />
          </h4>
          <dl>
            <dt>PRIVATE KEY</dt>
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
