import React from "react"
import connect from "../helpers/connect"
import { hashHistory } from "react-router"

import EncodedEventDetails from "./EncodedEventDetails"
import DecodedEventDetails from "./DecodedEventDetails"

const EventDetailsScreen = props => {
  const { logIndex, transactionHash } = props.routeParams
  console.log(logIndex, transactionHash)

  // TODO - wire up real event
  const PLACEHOLDER_EVENT = {
    contractName: "ComplexToken",
    contractAddress: "0x123456781234567812345678123456781234567812345678",
    signature: "ComplexTokenSent(uint256, uint32[], bytes10, bytes)",
    txHash: "0x123456781234567812345678123456781234567812345678",
    blockTime: "2018-08-31 20:31:35",
    returnValues: [
      { name: "MyIndexedParam", value: "20" },
      { name: "myNonIndexedParam", value: "This is a string" }
    ]
  }

  // TODO - use this flag only for dev, otherwise actually check if the event is decoded or not
  const decoded = true

  return (
    <div className="EventDetails">
      <div className="TitleBar">
        <button className="BackButton" onClick={hashHistory.goBack}>
          &larr; Back
        </button>
        <h1 className="Title">{transactionHash}</h1>
      </div>
      {decoded ? (
        <DecodedEventDetails event={PLACEHOLDER_EVENT} />
      ) : (
        <EncodedEventDetails event={PLACEHOLDER_EVENT} />
      )}
    </div>
  )
}

export default connect(EventDetailsScreen)
