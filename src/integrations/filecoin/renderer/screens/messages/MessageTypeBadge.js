import React, { Component } from "react";

export default class MessageTypeBadge extends Component {
  render() {
    if (this.props.method === 0) {
      return (
        <div className="MessageTypeBadge ValueTransferBadge">
          VALUE TRANSFER
        </div>
      );
    }
  }
}
