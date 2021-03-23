import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Deals from "../../../common/redux/deals/actions";
import DealList from "./DealList";

class DealsContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Deals.requestPage());
  }

  render() {
    return (
      <div className="DealsScreen">
        <DealList scrollPosition={this.props.scrollPosition} />
      </div>
    );
  }
}

export default connect(
  DealsContainer,
  ["filecoin.deals", "deals"]
);
