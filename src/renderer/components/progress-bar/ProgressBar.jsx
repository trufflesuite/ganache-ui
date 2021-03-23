import React, { Component } from "react";

export default class ProgressBar extends Component {
  render() {
    return (
      <div className="ProgressBar">
        <div className="ProgressBarOuter">
          <div
            className="ProgressBarInner"
            style={{
              width: `${this.props.percent}%`,
            }}
          >
            &nbsp;
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}
