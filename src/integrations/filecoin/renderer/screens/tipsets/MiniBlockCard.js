import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import Pluralize from "pluralize";

import OnlyIf from "../../../../../renderer/components/only-if/OnlyIf";
import { abbreviateCid } from "../../../common/utils/cid";

export default class MiniBlockCard extends PureComponent {
  render() {
    const { block, cid } = this.props;
    const messageCount = block.AdjustedBlockMessages.length;
    const hasMessages = messageCount > 0;

    // Adding `Filecoin` here to prevent CSS collision with ethereum
    const cardStyles = `FilecoinMiniBlockCard ${hasMessages ? "HasMessages" : ""}`;

    const gasUsed = block.AdjustedBlockMessages.reduce((sumGasUsed, blockMessage) => {
      return sumGasUsed + blockMessage.GasLimit;
    }, 0);

    return (
      <Link to={`/filecoin/tipsets/blocks/${cid}`} className="Link">
        <section className={cardStyles} key={`block_${cid}_detail`}>
          <div className="RowItem">
            <div className="BlockNumber">
              <div className="Label">BLOCK</div>
              <div className="Value">{`${abbreviateCid(cid, 4)}`}</div>
            </div>
          </div>
          <div className="PrimaryItems">
            <div className="RowItem">
              <div className="CID">
                <div className="Label">CID</div>
                <div className="Value">{cid}</div>
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
