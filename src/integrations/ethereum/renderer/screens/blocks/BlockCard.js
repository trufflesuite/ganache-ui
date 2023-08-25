import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Blocks from "../../../common/redux/blocks/actions";

import Moment from "react-moment";

import TxList from "../transactions/TxList";

class BlockCard extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Blocks.showBlock(this.props.blockNumber));
  }

  componentDidUpdate(prevProps) {
    if (this.props.blockNumber !== prevProps.blockNumber) {
      this.props.dispatch(Blocks.showBlock(prevProps.blockNumber));
    }
  }

  render() {
    const block = this.props.blocks.currentBlock;

    if (!block) {
      return <div />;
    }

    return (
      <section className="BlockCard">
        <header className="Header">
          <button className="Button" onClick={this.props.history.goBack}>
            &larr; Back
          </button>

          <div className="BlockNumber">
            <h1>BLOCK {Number(block.number)}</h1>
          </div>
        </header>

        <div className="BlockBody">
          <div className="HeaderSecondaryInfo">
            <div>
              <div className="Label">GAS USED</div>
              <div className="Value">{Number(block.gasUsed)}</div>
            </div>

            <div>
              <div className="Label">GAS LIMIT</div>
              <div className="Value">{Number(block.gasLimit)}</div>
            </div>

            <div>
              <div className="Label">MINED ON</div>
              <div className="Value">
                <Moment unix format="YYYY-MM-DD HH:mm:ss">
                  {Number(block.timestamp)}
                </Moment>
              </div>
            </div>

            <div className="BlockHash">
              <div className="Label">BLOCK HASH</div>
              <div className="Value">{block.hash}</div>
            </div>
          </div>
        </div>
        <TxList
          loading={false}
          transactions={block.transactions}
          receipts={block.receipts}
        />
      </section>
    );
  }
}

export default connect(
  BlockCard,
  "blocks",
  "transactions",
);
