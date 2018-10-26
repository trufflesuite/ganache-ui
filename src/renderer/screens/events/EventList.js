import React, { Component } from "react"

import connect from "../helpers/connect"

import EventItem from "./EventItem"

import * as Events from '../../../common/redux/events/actions'

class EventList extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    // If the scroll position changed...
    if (this.props.appshell.scrollPosition != prevProps.appshell.scrollPosition) {
      if (this.props.appshell.scrollPosition == "top") {
        this.props.dispatch(Events.requestPreviousPage())
      } else if (this.props.appshell.scrollPosition == "bottom") {
        this.props.dispatch(Events.requestNextPage())
      }
      return
    }

    // No change in scroll position? 
    const blocksRequested = Object.keys(this.props.events.blocksRequested)
    const latestBlockRequested = Math.max.apply(Math, blocksRequested.concat(-1))
    if (this.props.appshell.scrollPosition == "top" && this.props.core.latestBlock > latestBlockRequested) {
      this.props.dispatch(Events.requestPreviousPage())
    }
  }

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

export default connect(EventList, "appshell", "core", "events")
