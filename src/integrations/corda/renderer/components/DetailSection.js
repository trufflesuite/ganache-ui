import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";

const ICON = {
  STYLE : {
    "font-size":".8em",
    float: "right",
    "align-items": "center",
    "background-color": "rgba(107, 107, 107, 1.000)",
    "user-select" : "none",
    position: "relative",
    top: "-.5em"
  },
  CLASS : "TransactionTypeBadge ContractCallBadge"
}


class DetailSection extends Component {
  constructor(props){
    super(props);

    this.state = {
      collapse: false
    };
  }

  collapseSection = () => {
    this.setState({
      collapse: !this.state.collapse
    });
  };

  collapseIcon = () => {
    if (this.state.collapse) {
      return (<span className={ICON.CLASS} style={ICON.STYLE}> +</span>);
    }
    return (<span className={ICON.CLASS} style={ICON.STYLE}> -</span>);
  }

  render() {
    return (
      this.props.hide ? null :
      <div className="corda-details-section">
        <h3 className="Label" onClick={this.collapseSection}>
          {this.props.label} {this.collapseIcon()}
        </h3>
        <div className="Nodes DataRows">
          {this.state.collapse ? null : this.props.children}
        </div>
      </div>
    );
  }
}

export default connect(
  DetailSection
);
