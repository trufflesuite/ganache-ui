import React, { Component } from "react";
import connect from "../helpers/connect";
import * as Blocks from "../../../common/redux/blocks/actions";

import MiniBlockCard from "./MiniBlockCard";

class BlockList extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    // If the scroll position changed...
    const latestRequested =
      nextProps.blocks.requested[nextProps.core.latestBlock];
    const earliestRequested = nextProps.blocks.requested[0];
    if (
      nextProps.appshell.scrollPosition != this.props.appshell.scrollPosition
    ) {
      if (nextProps.appshell.scrollPosition == "top" && !latestRequested) {
        this.props.dispatch(Blocks.requestPreviousPage());
      } else if (
        nextProps.appshell.scrollPosition == "bottom" &&
        !earliestRequested
      ) {
        this.props.dispatch(Blocks.requestNextPage());
      }
      return;
    }

    // No change in scroll position? If a new block has been added,
    // request the previous page
    if (nextProps.blocks.inView.length == 0) {
      return;
    }

    var latestBlockInView = nextProps.blocks.inView[0].number;
    if (
      nextProps.appshell.scrollPosition == "top" &&
      nextProps.core.latestBlock > latestBlockInView &&
      !latestRequested
    ) {
      this.props.dispatch(Blocks.requestPreviousPage());
    }
  }

  render() {
    return (
      <div className="BlockList" ref="container">
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
