import { Link } from "react-router";
import React, { Component } from "react";
import connect from "../../../../renderer/screens/helpers/connect";

class TransactionLink extends Component {
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
          <div className="Value">{state.ref.txhash}</div>
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