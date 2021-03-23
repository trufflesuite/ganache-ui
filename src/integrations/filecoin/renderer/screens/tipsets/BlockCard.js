import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Tipsets from "../../../common/redux/tipsets/actions";

import Moment from "react-moment";

import MessageList from "../messages/MessageList";

class BlockCard extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Tipsets.showBlock(this.props.match.params.blockCid));
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.blockCid !== prevProps.match.params.blockCid) {
      this.props.dispatch(Tipsets.showBlock(prevProps.tipsetHeight));
    }
  }

  render() {
    const cid = this.props.match.params.blockCid;
    const block = this.props.tipsets.currentBlock;

    if (!block) {
      return <div />;
    }

    const gasUsed = block.AdjustedBlockMessages.reduce((sumGasUsed, blockMessage) => {
      return sumGasUsed + blockMessage.GasLimit;
    }, 0);

    return (
      <section className="FilecoinBlockCard">
        <header className="Header">
          <button className="Button" onClick={this.props.history.goBack}>
            &larr; Back
          </button>

          <div className="BlockNumber">
            <h1>BLOCK {cid}</h1>
          </div>
        </header>

        <div className="BlockBody">
          <div className="HeaderSecondaryInfo">
            <div>
              <div className="Label">GAS USED</div>
              <div className="Value">{gasUsed}</div>
            </div>

            <div>
              <div className="Label">MINED ON</div>
              <div className="Value">
                <Moment unix format="YYYY-MM-DD HH:mm:ss">
                  {block.Timestamp}
                </Moment>
              </div>
            </div>

            <div className="BlockCID">
              <div className="Label">BLOCK CID</div>
              <div className="Value">{cid}</div>
            </div>
          </div>
        </div>
        <MessageList
          loading={false}
          messages={block.AdjustedBlockMessages}
        />
      </section>
    );
  }
}

export default connect(
  BlockCard,
  ["filecoin.tipsets", "tipsets"]
);
