import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Tipsets from "../../../common/redux/tipsets/actions";
import BlockList from "./BlockList";

import Moment from "react-moment";

class TipsetCard extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Tipsets.showTipset(this.props.tipsetHeight));
  }

  componentDidUpdate(prevProps) {
    if (this.props.tipsetHeight !== prevProps.tipsetHeight) {
      this.props.dispatch(Tipsets.showTipset(prevProps.tipsetHeight));
    }
  }

  render() {
    const tipsetDetails = this.props.tipsets.currentTipsetDetails;

    if (!tipsetDetails) {
      return <div />;
    }

    return (
      <section className="TipsetCard">
        <header className="Header">
          <button className="Button" onClick={this.props.history.goBack}>
            &larr; Back
          </button>

          <div className="TipsetHeight">
            <h1>TIPSET {tipsetDetails.tipset.Height}</h1>
          </div>
        </header>

        <div className="TipsetBody">
          <div className="HeaderSecondaryInfo">
            <div>
              <div className="Label">GAS USED</div>
              <div className="Value">{tipsetDetails.gasUsed}</div>
            </div>

            <div>
              <div className="Label">MINED ON</div>
              <div className="Value">
                <Moment unix format="YYYY-MM-DD HH:mm:ss">
                  {tipsetDetails.tipset.Blocks[0].Timestamp}
                </Moment>
              </div>
            </div>

            <div>
              <div className="Label">MESSAGES</div>
              <div className="Value">{tipsetDetails.messageCount}</div>
            </div>
          </div>
        </div>
        <BlockList
          loading={false}
          blocks={tipsetDetails.tipset.Blocks}
          cids={tipsetDetails.tipset.Cids}
        />
      </section>
    );
  }
}

export default connect(
  TipsetCard,
  ["filecoin.tipsets", "tipsets"],
);
