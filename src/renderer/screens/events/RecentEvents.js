import React, { Component } from "react";

import connect from "../helpers/connect";

import EventList from "./EventList";

import * as Events from "../../../common/redux/events/actions";

class RecentEvents extends Component {
  componentDidUpdate(prevProps) {
    // If the scroll position changed...
    if (
      this.props.appshell.scrollPosition != prevProps.appshell.scrollPosition
    ) {
      if (this.props.appshell.scrollPosition == "top") {
        this.props.dispatch(Events.requestPreviousPage());
      } else if (this.props.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Events.requestNextPage());
      }
      return;
    }

    // No change in scroll position?
    const blocksRequested = Object.keys(this.props.events.blocksRequested);
    const latestBlockRequested = Math.max.apply(
      Math,
      blocksRequested.concat(-1),
    );
    if (
      this.props.appshell.scrollPosition == "top" &&
      this.props.core.latestBlock > latestBlockRequested
    ) {
      this.props.dispatch(Events.requestPreviousPage());
    }
  }

  render() {
    return (
      <div className="RecentEvents">
        <EventList eventList={this.props.eventList} />
      </div>
    );
  }
}

export default connect(
  RecentEvents,
  "appshell",
  "core",
  "events",
);
