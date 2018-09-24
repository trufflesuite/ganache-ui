import React from "react"

const DecodedEventDetails = ({ event }) => {
  const {
    txHash,
    blockTime,
    contractName,
    contractAddress,
    signature,
    logIndex
  } = event
  return (
    <div className="DecodedEventDetails">
      <div className="DataSection">
        <div className="DataRow">
          <div className="DataPoint">
            <div className="Label">CONTRACT NAME</div>
            <div className="Value">{contractName}</div>
          </div>
          <div className="DataPoint">
            <div className="Label">CONTRACT ADDRESS</div>
            <div className="Value">{contractAddress}</div>
          </div>
        </div>
      </div>
      <div className="DataSection">
        <div className="DataRow">
          <div className="DataPoint">
            <div className="Label">SIGNATURE (DECODED)</div>
            <div className="Value">{signature}</div>
          </div>
        </div>
        <div className="DataRow">
          <div className="DataPoint">
            <div className="Label">TX HASH</div>
            <div className="Value">{txHash}</div>
          </div>
          <div className="DataPoint">
            <div className="Label">LOG INDEX</div>
            <div className="Value">{logIndex}</div>
          </div>
          <div className="DataPoint">
            <div className="Label">BLOCK TIME</div>
            <div className="Value">{blockTime}</div>
          </div>
        </div>
      </div>
      <div className="SectionHeading">
        <h1>RETURN VALUES</h1>
      </div>

      <div className="DataSection">
        {event.returnValues.map((returnVal, index) => (
          <div className="DataRow" key={index}>
            <div className="DataPoint">
              <div className="Label">{returnVal.name}</div>
              <div className="Value">{returnVal.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DecodedEventDetails
