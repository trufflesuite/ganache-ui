import { Link } from "react-router";
import React, { PureComponent } from "react";

class NodeLink extends PureComponent {
  render() {
    const type = this.props.type === "notary" ? "notaries" : "nodes";
    const node = this.props.node;
    const services = this.props.services || [];
    return (
      <Link to={`/corda/${type}/${node.safeName}`} className="DataRow">
        <div>
          <div className="Label">Legal ID</div>
          <div className="Value">{node.name}</div>
        </div>
        <div>
          <div className="Label">DB Connection String</div>
          <div className="Value">{node.dbPort}</div>
        </div>
        <div>
          <div className="Label">RPC Port</div>
          <div className="Value">{node.rpcPort}</div>
        </div>
        <div>
          <div className="Label">Services</div>
          {services.map((service) => <div key={`service-${service}`} className="Value">{service}</div>)}
        </div>
      </Link>
    );
  }
}

export default NodeLink;
