import React from "react"

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

export default EncodedEventDetails
