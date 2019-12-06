import connect from "../../../../renderer/screens/helpers/connect";

import NodeLink from "../components/NodeLink";
import React, { Component } from "react";

class Nodes extends Component {
  render() {
    const type = this.props.route.path === "/corda/notaries" ? "notaries" : "nodes";
    const workspace = this.props.config.settings.workspace;
    const services = type === "nodes" ? [] : [];
    return (
      <div className="Nodes DataRows">
        <main>
          {workspace[type].map((node) => (<NodeLink key={`node-${node.safeName}`} node={node} services={services} />))}
        </main>
      </div>
    );
  }
}

export default connect(
  Nodes,
  "config"
);
