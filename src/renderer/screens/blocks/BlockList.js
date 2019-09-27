import React, { Component } from "react";
import connect from "../helpers/connect";
import * as Blocks from "../../../common/redux/blocks/actions";

import MiniBlockCard from "./MiniBlockCard";

class BlockList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    // If the scroll position changed...
    const latestRequested =
    prevProps.blocks.requested[prevProps.core.latestBlock];
    const earliestRequested = prevProps.blocks.requested[0];
    if (
      prevProps.appshell.scrollPosition != this.props.appshell.scrollPosition
    ) {
      if (prevProps.appshell.scrollPosition == "top" && !latestRequested) {
        this.props.dispatch(Blocks.requestPreviousPage());
      } else if (
        prevProps.appshell.scrollPosition == "bottom" &&
        !earliestRequested
      ) {
        this.props.dispatch(Blocks.requestNextPage());
      }
      return;
    }

    // No change in scroll position? If a new block has been added,
    // request the previous page
    if (prevProps.blocks.inView.length == 0) {
      return;
    }

    var latestBlockInView = prevProps.blocks.inView[0].number;
    if (
      prevProps.appshell.scrollPosition == "top" &&
      prevProps.core.latestBlock > latestBlockInView &&
      !latestRequested
    ) {
      this.props.dispatch(Blocks.requestPreviousPage());
    }
  }

  render() {
    return (
      <div className="BlockList">
        {this.props.blocks.inView.map(block => {
          return (
            <MiniBlockCard
              key={`block-${block.number}`}
              block={block}
              transactionCount={
                this.props.blocks.inViewTransactionCounts[block.number]
              }
            />
          );
        })}
      </div>
    );
  }
}

export default connect(
  BlockList,
  "blocks",
  "core",
  "appshell",
);
