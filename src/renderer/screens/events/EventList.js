import React, { Component } from "react"

import connect from "../helpers/connect"

import EventItem from "./EventItem"

class EventList extends Component {
  render() {
    if (this.props.eventList.length === 0) {
      return (
        <div className="EventList">
          <div className="Waiting">No events</div>
        </div>
      )
    }

    return (
      <div className="EventList">
        {this.props.eventList.map((event, index) => (
          <EventItem event={event} key={index} />
        ))}
      </div>
    )
  }
}

export default connect(EventList)
