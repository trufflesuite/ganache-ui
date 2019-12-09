import { Link } from "react-router";
import React, { PureComponent } from "react";

class TransactionLink extends PureComponent {
  render() {
    const node = this.props.node;
    const state = this.props.tx;
    return (
      <Link to={`/corda/transactions/${node.safeName}/${state.ref.txhash}`} className="DataRow">
        <div>
          <div className="Label">Transaction Hash</div>
          <div className="Value">{state.ref.txhash}</div>
        </div>
        <div>
          <div className="Label">Participants</div>
          <div className="Value">
            {state.state.data.participants.map(node => (
              <div key={node.name}>{node.name}</div>
            ))}
          </div>
        </div>
      </Link>
    );
  }
}

export default TransactionLink;
