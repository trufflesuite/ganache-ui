import connect from "../../../../renderer/screens/helpers/connect";

import { push } from "react-router-redux";
import React, { Component } from "react";

function line(node, services = []) {
  const goToNodeDetails = () => {
    this.props.dispatch(
      push(`/corda/nodes/${node.safeName}`),
    );
  }
  return (<div key={`node-${node.safeName}`} className="DataRow" onClick={goToNodeDetails}>
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
      {services ? services.map((service)=>{
        return (<div key={`service-${service}`} className="Value">{service}</div>)
      }) : ""}
    </div>
  </div>);
}

class Nodes extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const type = this.props.route.path === "/corda/notaries" ? "notaries" : "nodes";
    const workspace = this.props.config.settings.workspace;
    const services = type === "nodes" ? [] : [];
    return (
      <div className="Nodes DataRows">
        <main>
          {workspace[type].map((node) => line.bind(this)(node, services))}
        </main>
      </div>
    );
  }
}

export default connect(
  Nodes,
  "config"
);
