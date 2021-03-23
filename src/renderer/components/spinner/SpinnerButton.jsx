import React, { Component } from "react";

import Styles from "./SpinnerButton.css";

export default class SpinnerButton extends Component {
  render() {
    const className = `${Styles.SpinnerButton} ${
      this.props.isActive ? Styles.Active : ""
    } ${this.props.className ? this.props.className : ""}`;

    return (
      <button className={className} onClick={this.props._handleOnClick}>
        <span className={Styles.Label}>{this.props.label}</span>
        <span className={Styles.Loader}>
          <div />
        </span>
      </button>
    );
  }
}
