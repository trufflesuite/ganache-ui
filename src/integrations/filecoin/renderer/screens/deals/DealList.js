import React, { Component } from "react";
import MDSpinner from "react-md-spinner";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Deals from "../../../common/redux/deals/actions";

import MiniDealCard from "./MiniDealCard";

class DealList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    // If the scroll position changed...
    const latestRequested = prevProps.deals.requested[prevProps.core.latestDeal];
    const earliestRequested = prevProps.deals.requested[0];
    if (
      prevProps.appshell.scrollPosition != this.props.appshell.scrollPosition
    ) {
      if (prevProps.appshell.scrollPosition == "top" && !latestRequested) {
        this.props.dispatch(Deals.requestPreviousPage());
      } else if (
        prevProps.appshell.scrollPosition == "bottom" &&
        !earliestRequested
      ) {
        this.props.dispatch(Deals.requestNextPage());
      }
      return;
    }

    // No change in scroll position? If a new block has been added,
    // request the previous page
    if (prevProps.deals.inView.length == 0) {
      return;
    }

    const latestDealInView = prevProps.deals.inView[0].DealID;
    if (
      prevProps.appshell.scrollPosition == "top" &&
      prevProps.core.latestDeal > latestDealInView &&
      !latestRequested
    ) {
      this.props.dispatch(Deals.requestPreviousPage());
    }
  }

  render() {
    var content;
    if (this.props.deals.inView.length > 0) {
      content = this.props.deals.inView.map(deal => {
        return (
          <MiniDealCard
            key={`deal-${deal.DealID}`}
            deal={deal}
          />
        );
      });
    } else {
      if (this.props.loading) {
        content = (
          <div className="Waiting">
            <MDSpinner
              singleColor="var(--primary-color)"
              size={30}
              borderSize={3}
              className="spinner"
              duration={2666}
            />
          </div>
        );
      } else {
        content = <div className="Waiting">No deals</div>;
      }
    }

    return <div className="DealList">{content}</div>;
  }
}

export default connect(
  DealList,
  ["filecoin.core", "core"],
  ["filecoin.deals", "deals"],
  "appshell",
);
