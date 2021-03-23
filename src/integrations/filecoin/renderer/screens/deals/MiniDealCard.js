import React, { PureComponent } from "react";
import Moment from "react-moment";

import DealStatusBadge from "./DealStatusBadge";

export default class MiniDealCard extends PureComponent {
  render() {
    const { deal } = this.props;
    const cardStyles = `MiniDealCard`;

    return (
      <section className={cardStyles} key={`deal_${deal.DealID}_detail`}>
        <div className="RowItem">
          <div className="DealID">
            <div className="Label">DEAL</div>
            <div className="Value">{deal.DealID}</div>
          </div>
        </div>
        <div className="PrimaryItems">
          <div className="RowItem">
            <div className="DealCID">
              <div className="Label">DEAL CID</div>
              <div className="Value">{deal.ProposalCid["/"]}</div>
            </div>
          </div>
          <div className="RowItem">
            <div className="MinedOn">
              <div className="Label">CREATED</div>
              <div className="Value">
                <Moment format="YYYY-MM-DD HH:mm:ss">
                  {deal.CreationTime}
                </Moment>
              </div>
            </div>
          </div>
          <div className="RowItem">
            <DealStatusBadge status={deal.State} />
          </div>
        </div>
      </section>
    );
  }
}
