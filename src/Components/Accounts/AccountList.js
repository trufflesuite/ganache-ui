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

  saveName = (event) => {
    var id = event.target.id;
    var val = this.capitalize(event.target.value);
    localStorage.setItem(id, val);
    this.setState({inputValue: val});
  }

  getName = (account_id) => {
    var val = localStorage.getItem(account_id);
    if (val) {
      return val;
    } else {
      return "";
    }
  }

  capitalize = (str) => {
    return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
      return letter.toUpperCase();
    });
  }

  _renderAccounts = () => {
    const self = this
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
              <div className="Label">BALANCE (ETH)</div>
              <div className="Value">
                <FormattedEtherValue value={this.props.balances[account].toString()} />
              </div>
            </div>
            <div className="AccountName">
             <div className="Label">NAME (AUTO-SAVE)</div>
             <input type="text" value={this.getName(`acc-name-${index}`)} onChange={this.saveName} id={`acc-name-${index}`}/>
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
                self.showKeys(
                  account,
                  // need to pass lower case account here because account is
                  // checksummed address
                  self.props.privateKeys[account.toLowerCase()]
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
