import React, { Component } from "react";

export default class TransactionTypeBadge extends Component {
  render() {
    if (
      this.props.receipt.hasOwnProperty("contractAddress") &&
      this.props.receipt.contractAddress !== null
    ) {
      return (
        <div className="TransactionTypeBadge ContractCreationBadge">
          CONTRACT CREATION
        </div>
      );
    }

    if (this.props.tx.to && this.props.tx.input) {
      return (
        <div className="TransactionTypeBadge ContractCallBadge">
          CONTRACT CALL
        </div>
      );
    }

    if (this.props.tx.to && this.props.tx.value > 0) {
      return (
        <div className="TransactionTypeBadge ValueTransferBadge">
          VALUE TRANSFER
        </div>
      );
    }
  }
}
