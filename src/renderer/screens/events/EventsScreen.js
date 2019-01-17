import React, { Component } from "react";
import connect from "../helpers/connect";
import EventList from "./EventList";

import * as Events from "../../../common/redux/events/actions";

class EventsScreen extends Component {
  componentDidMount() {
    this.props.dispatch(Events.requestPage());
  }

  componentWillUnmount() {
    this.props.dispatch(Events.clearEventsInView());
  }

  render() {
    return (
      <div className="EventsScreen">
        <EventList
          loading={this.props.events.loading}
          eventList={this.props.events.inView}
        />
      </div>
    );
  }
}

export default connect(
  EventsScreen,
  "core",
  "appshell",
  "events",
);
