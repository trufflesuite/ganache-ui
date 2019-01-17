import React, { Component } from "react";
import MDSpinner from "react-md-spinner";

import connect from "../helpers/connect";

import EventItem from "./EventItem";

class EventList extends Component {
  render() {
    if (this.props.eventList.length === 0) {
      if (this.props.loading) {
        return (
          <div className="EventList">
            <div className="Waiting">
              <MDSpinner
                singleColor="var(--primary-color)"
                size={30}
                borderSize={3}
                className="spinner"
                duration={2666}
              />
            </div>
          </div>
        );
      } else {
        return (
          <div className="EventList">
            <div className="Waiting">No events</div>
          </div>
        );
      }
    }

    return (
      <div className="EventList">
        {this.props.eventList.map((event, index) => (
          <EventItem event={event} key={index} />
        ))}
      </div>
    );
  }
}

export default connect(EventList);
