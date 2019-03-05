import React, { PureComponent } from "react";

export default class Modal extends PureComponent {
  render() {
    return (
      <div className={`Modal ${this.props.className}`}>
        {this.props.children}
      </div>
    );
  }
}
