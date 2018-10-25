import React, { Component } from "react"
import connect from "../helpers/connect"
import EventList from "./EventList"

import * as Events from '../../../common/redux/events/actions'

const events = []

class EventsScreen extends Component {
  componentDidMount() {
    this.props.dispatch(Events.requestPage())
  }

  componentWillUnmount() {
    this.props.dispatch(Events.clearEventsInView())
  }

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
    return (
      <div className="EventsScreen">
        <EventList events={this.props.events.inView} />
      </div>
    )
  }
}

export default connect(
  EventsScreen,
  "core",
  "appshell",
  "events"
)
