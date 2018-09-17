import React, { Component } from "react"

import connect from "../helpers/connect"

// import EventItem from "./EventItem"

const EventList = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="EventList">
        <div className="Waiting">No events</div>
      </div>
    )
  }

  return (
    <div className="EventList">
      {events.map(event => (
        <div>{JSON.stringify(event, null, 4)}</div>
      ))}
    </div>
  )
}

export default connect(EventList)
