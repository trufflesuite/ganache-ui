import React, { Component } from 'react'

import Styles from './TransactionTypeBadge.css'

export default class TransactionTypeBadge extends Component {
  render () {
    if (
      this.props.tx.hasOwnProperty('contractAddress') &&
      this.props.tx.contractAddress !== null
    ) {
      return <div className={Styles.ContractCreationBadge}>CONTRACT CREATION</div>
    }

    if (this.props.tx.to && this.props.tx.value > 0) {
      return <div className={Styles.ValueTransferBadge}>VALUE TRANSFER</div>
    }

    if (this.props.tx.to && this.props.tx.data) {
      return <div className={Styles.ContractCallBadge}>CONTRACT CALL</div>
    }
  }
}
