import React, { Component } from "react";

class StyledSelect extends Component {
  render() {
    return (
      <div className="StyledSelect">
        <select
          className={this.props.className || ""}
          name={this.props.name}
          id={this.props.id}
          defaultValue={this.props.defaultValue}
          onChange={this.props.changeFunction}
        >
          {this.props.children}
        </select>
      </div>
    );
  }
}

export default StyledSelect;
