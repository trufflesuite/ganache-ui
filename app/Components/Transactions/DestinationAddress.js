import React, { Component } from 'react'

import Styles from './MiniTxCard.css'

export default class DestinationAddress extends Component {
  render () {
    const isContractCall =
      (this.props.receipt.hasOwnProperty('contractAddress') &&
        this.props.receipt.contractAddress !== null) ||
      (this.props.tx.to && this.props.tx.input)

    const isContractCreationCall =
      this.props.receipt.hasOwnProperty('contractAddress') &&
      this.props.receipt.contractAddress !== null

    return (
      <div className={Styles.To}>
        <div className={Styles.Label}>
          {isContractCreationCall
            ? 'CREATED CONTRACT ADDRESS'
            : isContractCall ? `TO CONTRACT ADDRESS` : `TO ADDRESS`}
        </div>
        <div className={Styles.Value}>
          {isContractCreationCall
            ? <div className={Styles.ContractCreationAddress}>
                <span>
                  {this.props.receipt.contractAddress}
                </span>
              </div>
            : <div>
                {this.props.tx.to}
              </div>}
        </div>
      </div>
    )
  }
}
