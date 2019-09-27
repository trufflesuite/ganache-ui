import React, { Component } from "react";

import connect from "../helpers/connect";

import * as Transactions from "../../../common/redux/transactions/actions";

import TxList from "./TxList";

class RecentTransactions extends Component {
  componentDidUpdate(prevProps) {
    // If the scroll position changed...
    if (
      prevProps.appshell.scrollPosition != this.props.appshell.scrollPosition
    ) {
      if (prevProps.appshell.scrollPosition == "top") {
        this.props.dispatch(Transactions.requestPreviousPage());
      } else if (prevProps.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Transactions.requestNextPage());
      }
      return;
    }

    // No change in scroll position?
    var blocksRequested = Object.keys(prevProps.transactions.blocksRequested);
    var latestBlockRequested = Math.max.apply(Math, blocksRequested.concat(-1));
    if (
      prevProps.appshell.scrollPosition == "top" &&
      prevProps.core.latestBlock > latestBlockRequested
    ) {
      this.props.dispatch(Transactions.requestPreviousPage());
    }
  }

  render() {
    return (
      <div className="RecentTransactions">
        <TxList
          loading={this.props.transactions.loading}
          transactions={this.props.transactions.inView}
          receipts={this.props.transactions.receipts}
        />
      </div>
    );
  }
}

export default connect(
  RecentTransactions,
  "transactions",
  "core",
  "appshell",
);
