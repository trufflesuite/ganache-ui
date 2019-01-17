import React, { Component } from "react";

import connect from "../helpers/connect";

import * as Transactions from "../../../common/redux/transactions/actions";

import TxList from "./TxList";

class RecentTransactions extends Component {
  componentWillReceiveProps(nextProps) {
    // If the scroll position changed...
    if (
      nextProps.appshell.scrollPosition != this.props.appshell.scrollPosition
    ) {
      if (nextProps.appshell.scrollPosition == "top") {
        this.props.dispatch(Transactions.requestPreviousPage());
      } else if (nextProps.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Transactions.requestNextPage());
      }
      return;
    }

    // No change in scroll position?
    var blocksRequested = Object.keys(nextProps.transactions.blocksRequested);
    var latestBlockRequested = Math.max.apply(Math, blocksRequested.concat(-1));
    if (
      nextProps.appshell.scrollPosition == "top" &&
      nextProps.core.latestBlock > latestBlockRequested
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
