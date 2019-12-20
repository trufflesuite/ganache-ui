import { Link } from "react-router-dom";
import React, { PureComponent } from "react";

class NodeLink extends PureComponent {
  render() {
    const type = this.props.type === "notary" ? "notaries" : "nodes";
    const node = this.props.node;
    const services = this.props.services || [];
    return (
      <Link to={`/corda/${type}/${node.safeName}`} className="DataRow corda-node-link">
        <div className="corda-link-left">
          <div className="corda-node-name-description">
            <div className="Label">Legal ID</div>
            <div className="Value">{node.name}</div>
          </div>
          <div className="corda-node-port-description">
            <div className="Label">RPC Port</div>
            <div className="Value">{node.rpcPort}</div>
          </div>
          <div className="corda-node-port-description">
            <div className="Label">P2P Port</div>
            <div className="Value">{node.p2pPort}</div>
          </div>
          <div className="corda-node-port-description">
            <div className="Label">Admin Port</div>
            <div className="Value">{node.adminPort}</div>
          </div>
        </div>
        <div className="corda-link-right">
          {services.map((service) => <div className="TransactionTypeBadge ContractCallBadge" key={`service-${service}`}>{service}</div>)}
        </div>
      </Link>
    );
  }
}

export default NodeLink;
