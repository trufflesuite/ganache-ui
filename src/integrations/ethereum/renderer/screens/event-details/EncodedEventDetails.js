import React from "react";
import Moment from "react-moment";
import { Link } from "react-router";

const EncodedEventDetails = ({ event }) => {
  const { transactionHash, timestamp, contractAddress, logIndex } = event;
  return (
    <div className="EncodedEventDetails">
      <div className="Notice">
        <span className="Warning">⚠</span>{" "}
        <strong>To see rich event data</strong>{" "}
        <Link className="settingsLink" to="/config">
          link a Truffle Project
        </Link>{" "}
        containing the contract that emits this event.
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
      <div className="DataRow">
        <div className="DataPoint">
          <div className="Label">CONTRACT</div>
          <div className="Value">{contractAddress}</div>
        </div>
      </div>
    </div>
  );
};

export default EncodedEventDetails;
