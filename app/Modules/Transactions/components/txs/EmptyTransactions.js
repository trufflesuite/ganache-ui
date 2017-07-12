import React, { Component } from 'react'

import Icon from 'Elements/Icon'

import Styles from './EmptyTransactions.css'

export default class EmptyTransactions extends Component {
  render () {
    return (
      <div className={Styles.EmptyTransactions}>
        <Icon name="no_transactions" size={128} />
        <p>There are no Transactions to view</p>
      </div>
    )
  }
}
