import React, { Component } from 'react'

import Styles from './Transactions.css'

export default class TransactionsContainer extends Component {
  render () {
    return (
      <div className={Styles.Transactions}>
        {this.props.children}
      </div>
    )
  }
}
