import React, { Component } from "react"

import connect from "../helpers/connect"

import EventItem from "./EventItem"

class EventList extends Component {
  render() {
    if (this.props.events.length === 0) {
      return (
        <div className="EventList">
          <div className="Waiting">No events</div>
        </div>
      )
    }

    return (
      <div className="EventList">
        {this.props.events.map((event, index) => (
          <EventItem event={event} key={index} dispatch={dispatch} />
        ))}
      </div>
    )
  }
}

export default connect(EventList)
