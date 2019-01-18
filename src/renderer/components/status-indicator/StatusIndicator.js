import React, { Component } from "react";

import OnlyIf from "../only-if/OnlyIf";

export default class StatusIndicator extends Component {
  render() {
    return (
      <div className="StatusIndicator">
        <div className="Metric">
          <h4>{this.props.title}</h4>
          <span>{this.props.value}</span>
        </div>
        <OnlyIf test={this.props.children}>
          <div className="Indicator">{this.props.children}</div>
        </OnlyIf>
      </div>
    );
  }
}
