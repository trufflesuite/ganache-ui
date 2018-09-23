import React from "react"
import { hashHistory } from "react-router"

const EncodedEventDetails = ({ event }) => {
  const { txHash, blockTime, contractName } = event
  return (
    <div className="EncodedEventDetails">
      <div className="Notice">
        <span className="Warning">⚠</span>{" "}
        <strong>To see rich event data</strong> link a Truffle Project
        containing the contract that emits this event.
      </div>
      <div className="DataRow">
        <div className="DataPoint">
          <div className="Label">TX HASH</div>
          <div className="Value">{txHash}</div>
        </div>
        <div className="DataPoint">
          <div className="Label">BLOCK TIME</div>
          <div className="Value">{blockTime}</div>
        </div>
      </div>
      <div className="DataRow">
        <div className="DataPoint">
          <div className="Label">CONTRACT</div>
          <div className="Value">{contractName}</div>
        </div>
      </div>
    </div>
  )
}

export default props => {
  const { logIndex, transactionHash } = props.routeParams
  console.log(logIndex, transactionHash)

  const PLACEHOLDER_EVENT = {
    txHash: "PLACEHOLDER_EVENT_TX_HASH",
    blockTime: "PLACEHOLDER_BLOCKTIME",
    contractName: "PLACEHOLDER_CONTRACT_NAME"
  }
  return (
    <div className="EventDetails">
      <div className="TitleBar">
        <button className="BackButton" onClick={hashHistory.goBack}>
          &larr; Back
        </button>
        <h1 className="Title">{transactionHash}</h1>
      </div>
      <EncodedEventDetails event={PLACEHOLDER_EVENT} />
    </div>
  )
}
