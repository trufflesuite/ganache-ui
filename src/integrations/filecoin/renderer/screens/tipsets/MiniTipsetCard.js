import React, { PureComponent } from "react";
import Moment from "react-moment";
import Pluralize from "pluralize";
import { Link } from "react-router-dom";

import OnlyIf from "../../../../../renderer/components/only-if/OnlyIf";

export default class MiniTipsetCard extends PureComponent {
  render() {
    const { tipset, messageCount, gasUsed } = this.props;
    const hasMessages = messageCount > 0;
    const cardStyles = `MiniTipsetCard ${hasMessages ? "HasMessages" : ""}`;

    return (
      <Link to={`/filecoin/tipsets/${this.props.tipset.Height}`} className="Link">
        <section className={cardStyles} key={`tipset_${tipset.Height}_detail`}>
          <div className="RowItem">
            <div className="TipsetHeight">
              <div className="Label">TIPSET</div>
              <div className="Value">{tipset.Height}</div>
            </div>
          </div>
          <div className="PrimaryItems">
            <div className="RowItem">
              <div className="MinedOn">
                <div className="Label">MINED ON</div>
                <div className="Value">
                  <Moment unix format="YYYY-MM-DD HH:mm:ss">
                    {tipset.Blocks[0].Timestamp}
                  </Moment>
                </div>
              </div>
            </div>
            <div className="RowItem">
              <div className="GasUsed">
                <div className="Label">GAS USED</div>
                <div className="Value">{gasUsed}</div>
              </div>
            </div>
            <div className="RowItem">
              <OnlyIf test={messageCount > 0}>
                <div className="MessageBadge">
                  {messageCount}{" "}
                  {Pluralize("MESSAGE", messageCount)}
                </div>
              </OnlyIf>
              <OnlyIf test={messageCount === 0}>
                <div className="NoMessageBadge">NO MESSAGES</div>
              </OnlyIf>
            </div>
          </div>
        </section>
      </Link>
    );
  }
}
