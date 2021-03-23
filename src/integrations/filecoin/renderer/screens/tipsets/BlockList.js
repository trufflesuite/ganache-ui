import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";

import MiniBlockCard from "./MiniBlockCard";

class BlockList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const blocksWithCids = [];
    for (let i = 0; i < this.props.blocks.length; i++) {
      blocksWithCids.push({
        block: this.props.blocks[i],
        cid: this.props.cids[i]["/"]
      });
    }

    return (
      <div className="BlockList">
        {blocksWithCids.map(blockWithCid => {
          return (
            <MiniBlockCard
              key={`block-${blockWithCid.cid}`}
              block={blockWithCid.block}
              cid={blockWithCid.cid}
            />
          );
        })}
      </div>
    );
  }
}

export default connect(
  BlockList,
  ["filecoin.core", "core"],
  ["filecoin.tipsets", "tipsets"],
  "appshell",
);
