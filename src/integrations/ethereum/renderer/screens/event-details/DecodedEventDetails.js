import React from "react";
import Moment from "react-moment";

const DecodedEventDetails = ({ event }) => {
  const {
    transactionHash,
    timestamp,
    contractName,
    contractAddress,
    signature,
    logIndex,
  } = event;
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
            <div className="Value">{transactionHash}</div>
          </div>
          <div className="DataPoint">
            <div className="Label">LOG INDEX</div>
            <div className="Value">{logIndex}</div>
          </div>
          <div className="DataPoint">
            <div className="Label">BLOCK TIME</div>
            <div className="Value">
              <Moment unix format="YYYY-MM-DD HH:mm:ss">
                {timestamp}
              </Moment>
            </div>
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
              <div className="Value">
                {Array.isArray(returnVal.value)
                  ? returnVal.value.join(", ")
                  : returnVal.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecodedEventDetails;
