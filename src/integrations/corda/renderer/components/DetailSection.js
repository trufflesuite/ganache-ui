import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";

const ICON = {
  STYLE : {
    fontSize: "1.2em",
    background: "none",
    color: "var(--app-button-primary-background-color)",
    userSelect: "none",
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translate(-100%, -50%)",
    height: "auto",
    padding: 0,
    borderRadius: 0,
  },
  CLASS : [
    "TransactionTypeBadge",
    "ContractCallBadge"
  ].join(" ")
}

class DetailSection extends Component {
  constructor(props){
    super(props);

    this.state = {
      collapse: false
    };
  }

  collapseSection = () => this.setState({ collapse: !this.state.collapse });

  collapseIcon = () => {
    const icon = this.state.collapse ? "▼" : "▲";
    const title = this.state.collapse ? "Expand section" : "Collapse section";
    return (<span title={title} className={ICON.CLASS} style={ICON.STYLE}>{icon}</span>);
  }

  render() {
    return (
      this.props.hide ? null :
      <div className="corda-details-section">
        <h3 className="Label" onClick={this.collapseSection}>
          {this.props.label} {this.collapseIcon()}
        </h3>
        <div className="Nodes DataRows" style={{overflow: "hidden", height: this.state.collapse ? "1px" : "auto"}}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default connect(
  DetailSection
);
