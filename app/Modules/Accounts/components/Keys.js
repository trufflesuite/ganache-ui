import React, { PureComponent } from 'react'

import Icon from 'Elements/Icon'
import AccountIcon from 'Elements/icons/account.svg'

import Styles from './Keys.css'

export default class Keys extends PureComponent {
  render () {
    return (
      <div className={Styles.Modal}>
        <section>
          <Icon glyph={AccountIcon} size={128} />
          <h4>
            {this.props.accountAddress}
          </h4>
          <dl>
            <dt>PUBLIC KEY</dt>
            <dd>
              {this.props.publicKey}
            </dd>
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
