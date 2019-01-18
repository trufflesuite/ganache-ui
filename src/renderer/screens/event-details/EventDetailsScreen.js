import React, { Component } from "react";
import connect from "../helpers/connect";
import { hashHistory } from "react-router";

import EncodedEventDetails from "./EncodedEventDetails";
import DecodedEventDetails from "./DecodedEventDetails";

import * as Events from "../../../common/redux/events/actions";

class EventDetailsScreen extends Component {
  componentDidMount() {
    this.props.dispatch(
      Events.getDecodedEvent(
        this.props.params.transactionHash,
        parseInt(this.props.params.logIndex),
      ),
    );
  }

  render() {
    const { logIndex, transactionHash } = this.props.params;

    const shownEvent = this.props.events.shown;

    let event = {
      contractAddress: "",
      transactionHash,
      timestamp: null,
      logIndex,
    };

    if (shownEvent) {
      if (shownEvent.log) {
        event.timestamp = shownEvent.log.timestamp;
      }

      if (shownEvent.contract) {
        event.contractAddress = shownEvent.contract.address;
        if (shownEvent.contract.name) {
          event.contractName = shownEvent.contract.name;
        }
      }

      if (shownEvent.decodedLog) {
        event.signature =
          shownEvent.decodedLog.name +
          "(" +
          shownEvent.decodedLog.events
            .map(param => param.name + ": " + param.type)
            .join(", ") +
          ")";
        event.returnValues = shownEvent.decodedLog.events;
      }
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
    );
  }
}

export default connect(
  EventDetailsScreen,
  "events",
);
