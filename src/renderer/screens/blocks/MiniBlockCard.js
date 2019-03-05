import React, { PureComponent } from "react";
import Moment from "react-moment";
import Pluralize from "pluralize";
import { Link } from "react-router";

import OnlyIf from "../../components/only-if/OnlyIf";

export default class MiniBlockCard extends PureComponent {
  render() {
    const { block, transactionCount } = this.props;
    const hasTxs = transactionCount > 0;
    const cardStyles = `MiniBlockCard ${hasTxs ? "HasTxs" : ""}`;

    return (
      <Link to={`/blocks/${this.props.block.number}`} className="Link">
        <section className={cardStyles} key={`block_${block.number}_detail`}>
          <div className="RowItem">
            <div className="BlockNumber">
              <div className="Label">BLOCK</div>
              <div className="Value">{block.number}</div>
            </div>
          </div>
          <div className="PrimaryItems">
            <div className="RowItem">
              <div className="MinedOn">
                <div className="Label">MINED ON</div>
                <div className="Value">
                  <Moment unix format="YYYY-MM-DD HH:mm:ss">
                    {block.timestamp}
                  </Moment>
                </div>
              </div>
            </div>
            <div className="RowItem">
              <div className="GasUsed">
                <div className="Label">GAS USED</div>
                <div className="Value">{block.gasUsed}</div>
              </div>
            </div>
            <div className="RowItem">
              <OnlyIf test={transactionCount > 0}>
                <div className="TransactionBadge">
                  {transactionCount}{" "}
                  {Pluralize("TRANSACTION", transactionCount)}
                </div>
              </OnlyIf>
              <OnlyIf test={transactionCount === 0}>
                <div className="NoTransactionBadge">NO TRANSACTIONS</div>
              </OnlyIf>
            </div>
          </div>
        </section>
      </Link>
    );
  }
}
