import React from "react"
import { hashHistory } from "react-router"

const EncodedEventDetails = ({ txHash, blockTime, contractName }) => (
  <div className="EncodedEventDetails">
    <div className="Notice">
      To see rich event data, link a Truffle Project containing the contract
      that emits this event.
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

export default props => {
  const { logIndex, transactionHash } = props.routeParams
  console.log(logIndex, transactionHash)
  return (
    <div className="EventDetails">
      <div className="TitleBar">
        <button className="BackButton" onClick={hashHistory.goBack}>
          &larr; Back
        </button>
        <h1 className="Title">{transactionHash}</h1>
      </div>
      <EncodedEventDetails />
    </div>
  )
}
