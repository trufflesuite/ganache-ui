import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Tipsets from "../../../common/redux/tipsets/actions";
import TipsetList from "./TipsetList";
import TipsetCard from "./TipsetCard";

class TipsetsContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Tipsets.requestPage());
  }

  render() {
    var content;
    if (this.props.match.params.tipsetHeight != null) {
      content = <TipsetCard tipsetHeight={this.props.match.params.tipsetHeight} />;
    } else {
      content = <TipsetList scrollPosition={this.props.scrollPosition} />;
    }
    return <div className="TipsetsScreen">{content}</div>;
  }
}

export default connect(
  TipsetsContainer,
  ["filecoin.tipsets", "tipsets"]
);
