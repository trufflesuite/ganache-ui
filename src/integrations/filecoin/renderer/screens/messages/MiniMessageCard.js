import React, { Component } from "react";

import { Link } from "react-router-dom";

import MessageTypeBadge from "./MessageTypeBadge";

export default class MiniMessageCard extends Component {
  render() {
    const { message } = this.props;
    const cid = message.cid["/"];

    return (
      <Link to={`/messages/${cid}`} className="Link">
        <div className="MiniMessageCard">
          <div className="Row Top">
            <div className="RowItem">
              <div className="MessageCID">
                <div className="Label">MESSAGE CID</div>
                <div className="Value">{cid}</div>
              </div>
            </div>

            <div className="RowItem">
              <MessageTypeBadge method={message.Method} />
            </div>
          </div>

          <div className="SecondaryItems">
            <div className="Row">
              <div className="RowItem">
                <div className="From">
                  <div className="Label">FROM ADDRESS</div>
                  <div className="Value">{message.From}</div>
                </div>
              </div>

              <div className="RowItem">
                <div className="To">
                  <div className="Label">TO ADDRESS</div>
                  <div className="Value">{message.To}</div>
                </div>
              </div>

              <div className="RowItem">
                <div className="GasUsed">
                  <div className="Label">GAS USED</div>
                  <div className="Value">{message.GasLimit}</div>
                </div>
              </div>

              <div className="RowItem">
                <div className="Value">
                  <div className="Label">VALUE</div>
                  <div className="Value">{message.Value}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }
}
