import React, { Component } from "react";

import connect from "../../../../../renderer/screens/helpers/connect";

import * as Messages from "../../../common/redux/messages/actions";

import MessageList from "./MessageList";

class RecentMessages extends Component {
  componentDidUpdate(prevProps) {
    // If the scroll position changed...
    if (
      prevProps.appshell.scrollPosition != this.props.appshell.scrollPosition
    ) {
      if (prevProps.appshell.scrollPosition == "top") {
        this.props.dispatch(Messages.requestPreviousPage());
      } else if (prevProps.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Messages.requestNextPage());
      }
      return;
    }

    // No change in scroll position?
    const tipsetsRequested = Object.keys(prevProps.messages.tipsetsRequested);
    const latestTipsetRequested = Math.max.apply(Math, tipsetsRequested.concat(-1));
    if (
      prevProps.appshell.scrollPosition == "top" &&
      prevProps.core.latestTipset > latestTipsetRequested
    ) {
      this.props.dispatch(Messages.requestPreviousPage());
    }
  }

  render() {
    return (
      <div className="RecentMessages">
        <MessageList
          loading={this.props.messages.loading}
          messages={this.props.messages.inView}
        />
      </div>
    );
  }
}

export default connect(
  RecentMessages,
  ["filecoin.messages", "messages"],
  ["filecoin.core", "core"],
  "appshell",
);
