import connect from "../../../../renderer/screens/helpers/connect";

import NodeLink from "../components/NodeLink";
import React, { Component } from "react";

class Nodes extends Component {
  render() {
    const workspace = this.props.config.settings.workspace;

    return (
      <div className="Nodes DataRows">
        <main>
          {workspace.nodes.map((node) => (<NodeLink key={`node-${node.safeName}`} postgresPort={workspace.postgresPort} node={node} />))}
          {workspace.notaries.map((node) => (<NodeLink key={`node-${node.safeName}`} postgresPort={workspace.postgresPort} node={node} services={["Notary"]} />))}
        </main>
      </div>
    );
  }
}

export default connect(
  Nodes,
  "config"
);
