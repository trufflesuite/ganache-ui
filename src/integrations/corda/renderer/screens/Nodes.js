import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";

function line(node, services = []) {
  return (<div key={`node-${node.safeName}`} className="DataRow">
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
    const workspace = this.props.config.settings.workspace;
    return (
      <div className="Nodes DataRows">
        <main>
          {workspace.nodes.map((node) => line(node))}
          {workspace.notaries.map((notary) => line(notary, ["Notary"]))}
        </main>
      </div>
    );
  }
}

export default connect(
  Nodes,
  "config"
);
