import React, { Component } from 'react'
import connect from '../Helpers/connect'

import ChecksumAddress from '../../Elements/ChecksumAddress'
import OnlyIf from '../../Elements/OnlyIf'
import FormattedEtherValue from '../../Elements/FormattedEtherValue'

import KeyIcon from '../../Elements/icons/key.svg'

import KeyModal from './KeyModal'

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
    return this.props.accounts.map((account, index) => {
      return (
        <div
          className="AccountCard"
          key={`account-card-${index}`}
        >
          <div className="AddressAndBalance">
            <div className="AccountAddress">
              <div className="Label">ADDRESS</div>
              <div className="Value">
                <ChecksumAddress address={account} />
              </div>
            </div>
            <div className="AccountBalance">
              <div className="Label">BALANCE</div>
              <div className="Value">
                <FormattedEtherValue value={this.props.balances[account].toString()} />
              </div>
            </div>
          </div>
          <div className="SecondaryInfo">
            <div className="TransactionCount">
              <div className="Label">TX COUNT</div>
              <div className="Value">
                {this.props.nonces[account]}
              </div>
            </div>
            <div className="AccountIndex">
              <div className="Label">INDEX</div>
              <div className="Value">
                {index}
              </div>
            </div>
            <span
              className="ShowKeys"
              onClick={() => {
                this.showKeys(
                  account,
                  this.props.privateKeys[account]
                )
              }}
            >
              <KeyIcon />
              <span className="popover">
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
      <div className="AccountList">
        {this._renderAccounts()}
        <OnlyIf test={this.state.showKeys}>
          <KeyModal
            accountAddress={this.state.accountAddress}
            privateKey={this.state.privateKey}
            onCloseModal={this.onCloseModal}
          />
        </OnlyIf>
      </div>
    )
  }
}

export default AccountList