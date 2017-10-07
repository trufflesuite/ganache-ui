import React, { Component } from 'react'

import OnlyIf from 'Elements/OnlyIf'
import FormattedEtherValue from 'Elements/FormattedEtherValue'

import Icon from 'Elements/Icon'
import LockedIcon from 'Elements/icons/locked.svg'
import UnlockedIcon from 'Elements/icons/unlocked.svg'
import KeyIcon from 'Elements/icons/key.svg'

import Keys from './Keys'

import Styles from './AccountList.css'

export default class AccountList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showKeys: false,
      privateKey: '',
      publicKey: '',
      accountAddress: ''
    }
  }

  showKeys = (accountAddress, privateKey, publicKey) => {
    this.setState({
      showKeys: true,
      privateKey,
      publicKey,
      accountAddress
    })
  }

  onCloseModal = () => {
    this.setState({
      showKeys: false
    })
  }

  _renderAccounts = accounts => {
    return accounts.map((account, index) => {
      return (
        <div
          className={Styles.AccountCard}
          key={`account-card-${index}`}
        >
          <div className={Styles.AddressAndBalance}>
            <div className={Styles.AccountAddress}>
              <div className={Styles.Label}>ADDRESS</div>
              <div className={Styles.Value}>
                {account}
              </div>
            </div>
            <div className={Styles.AccountBalance}>
              <div className={Styles.Label}>BALANCE</div>
              <div className={Styles.Value}>
                <FormattedEtherValue value={this.props.balances[account]} />
              </div>
            </div>
          </div>
          <div className={Styles.SecondaryInfo}>
            <div className={Styles.TransactionCount}>
              <div className={Styles.Label}>TX COUNT</div>
              <div className={Styles.Value}>
                {this.props.nonces[account]}
              </div>
            </div>
            <div className={Styles.AccountIndex}>
              <div className={Styles.Label}>INDEX</div>
              <div className={Styles.Value}>
                {index}
              </div>
            </div>
            <span
              className={Styles.ShowKeys}
              onClick={() => {
                this.showKeys(
                  account,
                  "<remove me>",
                  "<private key>"
                )
              }}
            >
              <Icon glyph={KeyIcon} size={24} className="isolate" />
              <span className={`${Styles.popover} ${Styles.above}`}>
                See Account Keys
              </span>
            </span>
            {/* <div className={Styles.AccountState}>
              {account.isUnlocked
                ? <Icon glyph={UnlockedIcon} size={24} className="isolate" />
                : <Icon glyph={LockedIcon} size={24} className="isolate" />}
            </div> */}
          </div>
        </div>
      )
    })
  }

  render () {
    return (
      <div className={Styles.AccountList}>
        {this._renderAccounts(this.props.accounts)}
        <OnlyIf test={this.state.showKeys}>
          <Keys
            accountAddress={this.state.accountAddress}
            privateKey={this.state.privateKey}
            publicKey={this.state.publicKey}
            onCloseModal={this.onCloseModal}
          />
        </OnlyIf>
      </div>
    )
  }
}
