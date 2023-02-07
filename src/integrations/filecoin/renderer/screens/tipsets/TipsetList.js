import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Tipsets from "../../../common/redux/tipsets/actions";

import MiniTipsetCard from "./MiniTipsetCard";

class TipsetList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    // If the scroll position changed...
    const latestRequested = prevProps.tipsets.requested[prevProps.core.latestTipset];
    const earliestRequested = prevProps.tipsets.requested[0];
    if (
      prevProps.appshell.scrollPosition != this.props.appshell.scrollPosition
    ) {
      if (this.props.appshell.scrollPosition === "top" && !latestRequested) {
        this.props.dispatch(Tipsets.requestPreviousPage());
      } else if (
        this.props.appshell.scrollPosition === "bottom" &&
        !earliestRequested
      ) {
        this.props.dispatch(Tipsets.requestNextPage());
      }
      return;
    }

    // No change in scroll position? If a new tipset has been added,
    // request the previous page. Be sure not to try to rerequest
    // if we already requested pages
    if (!latestRequested) {
      if (prevProps.tipsets.inView.length === 0) {
        if (this.props.core.latestTipset > 0) {
          this.props.dispatch(Tipsets.requestPreviousPage());
        }
      } else {
        const latestTipsetInView = prevProps.tipsets.inView[0].Height;
        if (
          prevProps.appshell.scrollPosition === "top" &&
          this.props.core.latestTipset > latestTipsetInView
        ) {
          this.props.dispatch(Tipsets.requestPreviousPage());
        }
      }
    }
  }

  render() {
    return (
      <div className="TipsetList">
        {this.props.tipsets.inView.map(tipset => {
          return (
            <MiniTipsetCard
              key={`tipset-${tipset.Height}`}
              tipset={tipset}
              gasUsed={this.props.tipsets.inViewGasUsed[tipset.Height]}
              messageCount={this.props.tipsets.inViewMessageCounts[tipset.Height]}
            />
          );
        })}
      </div>
    );
  }
}

export default connect(
  TipsetList,
  ["filecoin.core", "core"],
  ["filecoin.tipsets", "tipsets"],
  "appshell",
);
