import React, { Component } from "react";

import { push } from "react-router-redux";

import connect from "../helpers/connect";
import ModalDetails from "../../components/modal/ModalDetails";
import OnlyIf from "../../components/only-if/OnlyIf";

class ContractCard extends Component {
  handleClick() {
    if (this.props.address) {
      this.props.dispatch(
        push(`/contracts/${this.props.projectIndex}/${this.props.address}`),
      );
    } else {
      const modalDetails = new ModalDetails(
        ModalDetails.types.WARNING,
        [
          {
            value: "OK",
          },
        ],
        "Contract Not Deployed",
        "This contract is not deployed yet. Deploy this contract to see more info.",
      );

      this.props.dispatch(ModalDetails.actions.setModalError(modalDetails));
    }
  }

  render() {
    return (
      <div className="ContractCard" onClick={this.handleClick.bind(this)}>
        <div className="Row">
          <div className="RowItem">
            <div className="Name">
              <div className="Label">NAME</div>
              <div className="Value">{this.props.name}</div>
            </div>
          </div>

          <div className="RowItem">
            <div className="Address">
              <div className="Label">ADDRESS</div>
              <div className="Value">
                {this.props.address || "Not Deployed"}
              </div>
            </div>
          </div>

          <div className="RowItem">
            <div className="TxCount">
              <div className="Label">TX COUNT</div>
              <div className="Value">{this.props.txCount}</div>
            </div>
          </div>

          <div className="RowItem">
            <OnlyIf test={this.props.address !== ""}>
              <div className="StatusBadge">DEPLOYED</div>
            </OnlyIf>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(ContractCard);
