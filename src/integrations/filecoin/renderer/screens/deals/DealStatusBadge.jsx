import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";

class DealStatusBadge extends Component {
  render() {
    return (
      <div className="DealStatusBadge">
        {this.props.core.StorageDealStatus[this.props.status] || "UNKNOWN"}
      </div>
    );
  }
}

export default connect(
  DealStatusBadge,
  ["filecoin.core", "core"]
);
