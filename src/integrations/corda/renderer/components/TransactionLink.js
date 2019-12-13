import { Link } from "react-router";
import React, { Component } from "react";
import connect from "../../../../renderer/screens/helpers/connect";

class TransactionLink extends Component {
  /**
   * Mutates the objects in the `states` array. Sue me. :-p
   * @param {*} states 
   * @param {*} statesMetaData 
   */
  static joinAndSort(states, statesMetadata) {
    states = (states || []).map((transaction, i) => {
      transaction._metaData = statesMetadata[i];
      transaction._recordedTime = new Date(transaction._metaData.recordedTime);
      return transaction;
    });
    return states.sort(TransactionLink.sort);
  }
  static sort(a, b) {
    const timeDiff = b._recordedTime - a._recordedTime
    if (timeDiff !== 0) {
      return timeDiff;
    } else {
      if (b.ref.txhash === a.ref.txhash) {
        return b.ref.index - a.ref.index;
      } else if (b.ref.txhash < a.ref.txhash) {
        return 1;
      } else {
        return -1;
      }
    }
  }
  getWorkspaceNode(owningKey) {
    return this.props.config.settings.workspace.nodes.find(node => owningKey === node.owningKey);
  }
  render() {
    const node = this.props.node;
    const state = this.props.tx;
    return (
      <Link to={`/corda/transactions/${node.safeName}/${state.ref.txhash}/${state.ref.index}`} className="DataRow">
        <div>
          <div className="Label">Transaction Hash</div>
          <div className="Value">{state.ref.txhash} ({state.ref.index})</div>
        </div>
        <div>
          <div className="Label">Participants</div>
          <div className="Value">
            {state.state.data.participants.map(node => {
              const workspaceNode = this.getWorkspaceNode(node.owningKey);
              if (workspaceNode) {
                return (<div key={workspaceNode.safeName}>{workspaceNode.name}</div>)
              } else {
                return ("");
              }
            })}
          </div>
        </div>
      </Link>
    );
  }
}

export default connect(
  TransactionLink,
  "config",
);