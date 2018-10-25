import React, { Component } from "react"
import connect from "../helpers/connect"
import { hashHistory } from "react-router"

import EncodedEventDetails from "./EncodedEventDetails"
import DecodedEventDetails from "./DecodedEventDetails"

import * as Events from '../../../common/redux/events/actions'

class EventDetailsScreen extends Component {

  componentDidMount() {
    this.props.dispatch(Events.getDecodedEvent(this.props.params.transactionHash, parseInt(this.props.params.logIndex)))
  }

  render () {
    const { logIndex, transactionHash } = this.props.params

    let event = {
      contractAddress: this.props.events.shown.contract.address,
      txHash: transactionHash,
      blockTime: "TBD",
      logIndex: logIndex
    }

    if (this.props.events.shown.contract.name) {
      event.contractName = this.props.events.shown.contract.name
      event.signature = this.props.events.shown.decodedLog.name + "(" + this.props.events.shown.decodedLog.events.map((param) => param.name + ": " + param.type).join(", ") + ")"
      event.returnValues = this.props.events.shown.decodedLog.events
    }

    return (
      <div className="EventDetails">
        <div className="TitleBar">
          <button className="BackButton" onClick={hashHistory.goBack}>
            &larr; Back
          </button>
          <h1 className="Title">
            {transactionHash} ({logIndex})
          </h1>
        </div>
        {event.contractName ? (
          <DecodedEventDetails event={event} />
        ) : (
          <EncodedEventDetails event={event} />
        )}
      </div>
    )
  }
}

export default connect(EventDetailsScreen, "events")
