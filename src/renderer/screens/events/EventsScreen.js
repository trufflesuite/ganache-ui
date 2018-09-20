import React, { Component } from "react"
import connect from "../helpers/connect"
// import * as Events from "../../../common/redux/events/actions"
import EventDetails from "./EventDetails"
import RecentEvents from "./RecentEvents"

class EventsScreen extends Component {
  componentDidMount() {
    // this.props.dispatch(Events.requestPage())
  }

  componentWillUnmount() {
    // this.props.dispatch(Events.clearTransactionsInView())
  }

  render() {
    if (this.props.params.transactionHash != null) {
      return (
        <div className="EventsScreen">
          <EventDetails transactionHash={this.props.params.transactionHash} />
        </div>
      )
    }

    return (
      <div className="EventsScreen">
        <RecentEvents scrollPosition={this.props.scrollPosition} />
      </div>
    )
  }
}

export default connect(EventsScreen)
