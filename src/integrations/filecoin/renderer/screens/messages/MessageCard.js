import React, { Component } from "react";

import connect from "../../../../../renderer/screens/helpers/connect";
import OnlyIf from "../../../../../renderer/components/only-if/OnlyIf";

import * as Messages from "../../../common/redux/messages/actions";
import MessageTypeBadge from "./MessageTypeBadge";
import FormattedFILValue from "../../components/formatted-fil-value/FormattedFILValue";
import { abbreviateCid } from "../../../common/utils/cid";

class MessageCard extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(
      Messages.showMessage(this.props.cid),
    );
  }

  componentDidUpdate(prevProps) {
    const { cid, dispatch } = this.props;
    if (cid !== prevProps.cid) {
      dispatch(Messages.showMessage(cid));
    }
  }

  render() {
    const { cid, messages: { currentMessage: message } } = this.props;


    if (!message) {
      return <div />;
    }

    return (
      <section className="MessageCard">
        <div className="MessageInfo">
          <header>
            <button className="Button" onClick={this.props.history.goBack}>
              &larr; Back
            </button>

            <div className="Title">
              <h1>MESSAGE {cid}</h1>
            </div>
          </header>

          <section className="Parties">
            <div className="From">
              <div className="Label">FROM ADDRESS</div>
              <div className="Value">{message.From}</div>
            </div>
            <div className="To">
              <div className="Label">TO ADDRESS</div>
              <div className="Value">{message.To}</div>
            </div>
            <div>
              <div className="Value">
                <div className="Type">
                  <MessageTypeBadge method={message.Method} />
                </div>
              </div>
            </div>
          </section>

          <section className="Gas">
            <div>
              <div className="Label">VALUE</div>
              <div className="Value">
                <FormattedFILValue value={message.Value} />
              </div>
            </div>
            <div>
              <div className="Label">GAS USED</div>
              <div className="Value">{message.GasLimit}</div>
            </div>

            <div>
              <div className="Label">GAS PREMIUM</div>
              <div className="Value">{message.GasPremium}</div>
            </div>

            <OnlyIf test={message.tipsetHeight}>
              <div>
                <div className="Label">MINED IN TIPSET</div>
                <div className="Value">{message.tipsetHeight}</div>
              </div>
            </OnlyIf>

            <OnlyIf test={message.blockCid}>
              <div>
                <div className="Label">MINED IN BLOCK</div>
                <div className="Value">{abbreviateCid(message.blockCid["/"], 4)}</div>
              </div>
            </OnlyIf>
          </section>
        </div>
      </section>
    );
  }
}

export default connect(
  MessageCard,
  ["filecoin.messages", "messages"],
);
