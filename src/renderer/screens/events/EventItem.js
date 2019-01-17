import React, { Component } from "react";

import Moment from "react-moment";
import { push } from "react-router-redux";

import connect from "../helpers/connect";

class EventItem extends Component {
  render() {
    const {
      name,
      contract,
      address,
      transactionHash,
      timestamp,
      logIndex,
    } = this.props.event;
    const goToEventDetails = () =>
      this.props.dispatch(
        push(`/event_details/${transactionHash}/${logIndex}`),
      );
    return (
      <div className="EventItem" onClick={goToEventDetails}>
        <div className="Row Top">
          <div className="RowItem">
            <div className="Name">
              <div className="Label">EVENT NAME</div>
              <div className="Value">{name || "Encoded Event"}</div>
            </div>
          </div>
        </div>

        <div className="SecondaryItems">
          <div className="Row">
            <div className="RowItem">
              <div className="Contract">
                <div className="Label">CONTRACT</div>
                <div className="Value">{contract || address}</div>
              </div>
            </div>

            <div className="RowItem">
              <div className="TransactionHash">
                <div className="Label">TX HASH</div>
                <div className="Value">{transactionHash}</div>
              </div>
            </div>

            <div className="RowItem">
              <div className="LogIndex">
                <div className="Label">LOG INDEX</div>
                <div className="Value">{logIndex}</div>
              </div>
            </div>

            <div className="RowItem">
              <div className="BlockTime">
                <div className="Label">BLOCK TIME</div>
                <div className="Value">
                  <Moment unix format="YYYY-MM-DD HH:mm:ss">
                    {timestamp}
                  </Moment>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(EventItem);
