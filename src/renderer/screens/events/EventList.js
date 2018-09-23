import React, { Component } from "react"
import { push } from "react-router-redux"

import connect from "../helpers/connect"

// import EventItem from "./EventItem"

// TODO - refactor this out into its own file if it gets too big
const EventItem = ({ event, dispatch }) => {
  const { name, contract, txHash, blockTime, logIndex } = event
  const goToEventDetails = () =>
    dispatch(push(`/event_details/${txHash}/${logIndex}`))
  return (
    <div className="EventItem" onClick={goToEventDetails}>
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

const EventList = ({ events, dispatch }) => {
  if (events.length === 0) {
    return (
      <div className="EventList">
        <div className="Waiting">No events</div>
      </div>
    )
  }

  return (
    <div className="EventList">
      {events.map((event, index) => (
        <EventItem event={event} key={index} dispatch={dispatch} />
      ))}
    </div>
  )
}

export default connect(EventList)
