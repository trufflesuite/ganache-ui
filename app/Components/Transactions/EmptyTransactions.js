import React, { Component } from 'react'

import Icon from '../../Elements/Icon'
import EmptyTxIcon from '../../Elements/icons/no_transactions.svg'

import Styles from './EmptyTransactions.css'

export default class EmptyTransactions extends Component {
  render () {
    return (
      <div className={Styles.EmptyTransactions}>
        <Icon glyph={EmptyTxIcon} size={128} />
        <p>There are no Transactions to view</p>
      </div>
    )
  }
}
