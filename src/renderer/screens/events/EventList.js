import React, { Component } from "react"

import connect from "../helpers/connect"

// import EventItem from "./EventItem"

// TODO - refactor this out into its own file if it gets too big
const EventItem = ({ event }) => {
  const { name, contract, txHash, blockTime } = event
  return (
    <div className="EventItem">
      <div className="name">
        <div className="label">NAME</div>
        <div className="value">{name}</div>
      </div>
      <div className="data">
        <div className="dataItem">
          <div className="label">CONTRACT</div>
          <div className="value">{contract}</div>
        </div>
        <div className="dataItem">
          <div className="label">TX HASH</div>
          <div className="value">{txHash}</div>
        </div>
        <div className="dataItem">
          <div className="label">BLOCK TIME</div>
          <div className="value">{blockTime}</div>
        </div>
      </div>
    </div>
  )
}

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
        <EventItem event={event} />
      ))}
    </div>
  )
}

export default connect(EventList)
