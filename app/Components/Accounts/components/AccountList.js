import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'

import ChecksumAddress from 'Elements/ChecksumAddress'
import OnlyIf from 'Elements/OnlyIf'
import FormattedEtherValue from 'Elements/FormattedEtherValue'

import Icon from 'Elements/Icon'
import LockedIcon from 'Elements/icons/locked.svg'
import UnlockedIcon from 'Elements/icons/unlocked.svg'
import KeyIcon from 'Elements/icons/key.svg'

import Keys from './Keys'

import Styles from './AccountList.css'

class AccountList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showKeys: false,
      privateKey: '',
      accountAddress: ''
    }
  }

  showKeys = (accountAddress, privateKey) => {
    this.setState({
      showKeys: true,
      privateKey,
      accountAddress
    })
  }

  onCloseModal = () => {
    this.setState({
      showKeys: false
    })
  }

  _renderAccounts = () => {
    return this.props.accounts.addresses.map((account, index) => {
      return (
        <div
          className={Styles.AccountCard}
          key={`account-card-${index}`}
        >
          <div className={Styles.AddressAndBalance}>
            <div className={Styles.AccountAddress}>
              <div className={Styles.Label}>ADDRESS</div>
              <div className={Styles.Value}>
                <ChecksumAddress address={account} />
              </div>
            </div>
            <div className={Styles.AccountBalance}>
              <div className={Styles.Label}>BALANCE</div>
              <div className={Styles.Value}>
                <FormattedEtherValue value={this.props.accounts.balances[account].toString()} />
              </div>
            </div>
          </div>
          <div className={Styles.SecondaryInfo}>
            <div className={Styles.TransactionCount}>
              <div className={Styles.Label}>TX COUNT</div>
              <div className={Styles.Value}>
                {this.props.accounts.nonces[account]}
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
                  this.props.core.privateKeys[account]
                )
              }}
            >
              <Icon glyph={KeyIcon} size={24} className="isolate" />
              <span className={`${Styles.popover} ${Styles.above}`}>
                Show Keys
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
        {this._renderAccounts()}
        <OnlyIf test={this.state.showKeys}>
          <Keys
            accountAddress={this.state.accountAddress}
            privateKey={this.state.privateKey}
            onCloseModal={this.onCloseModal}
          />
        </OnlyIf>
      </div>
    )
  }
}

export default connect(AccountList, "core", "accounts")