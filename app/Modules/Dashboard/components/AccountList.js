import React, {Component} from 'react'

import Styles from './AccountList.css'

export default class AccountList extends Component {
  accountListRows = (accounts) => {
    return accounts.sort((a, b) => { return parseInt(a.index, 10) - parseInt(b.index, 10) }).map((account) => {
      return (
        <tr key={account.address}>
          <td>{account.index}</td>
          <td>{account.address}</td>
          <td>0x{account.privateKey}</td>
          <td>{account.balance} WEI</td>
          <td>{account.nonce}</td>
          <td>{ account.isUnlocked ? '🔓' : '🔐' }</td>
        </tr>
      )
    })
  }

  render () {
    return <table className={Styles.AccountList}>
      <thead>
        <tr>
          <td>INDEX</td>
          <td>ADDRESS</td>
          <td>PRIVATE KEY</td>
          <td>BALANCE (WEI)</td>
          <td>NONCE</td>
          <td>STATE</td>
        </tr>
      </thead>
      <tbody>
        { this.accountListRows(this.props.accounts) }
      </tbody>
    </table>
  }
}
