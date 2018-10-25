import React, { Component } from "react"

import connect from "../helpers/connect"

import EventItem from "./EventItem"

class EventList extends Component {
  componentWillReceiveProps(nextProps) {
    // If the scroll position changed...
    /*if (nextProps.appshell.scrollPosition != this.props.appshell.scrollPosition) {
      if (nextProps.appshell.scrollPosition == "top") {
        this.props.dispatch(Events.requestPreviousPage())
      } else if (nextProps.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Events.requestNextPage())
      }
      return
    }

    // No change in scroll position? 
    const blocksRequested = Object.keys(nextProps.events.blocksRequested)
    const latestBlockRequested = Math.max.apply(Math, blocksRequested.concat(-1))
    if (nextProps.appshell.scrollPosition == "top" && nextProps.core.latestBlock > latestBlockRequested) {
      this.props.dispatch(Events.requestPreviousPage())
    }*/
  }

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
