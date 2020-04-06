import connect from "../../../../renderer/screens/helpers/connect";

import NodeLink from "../components/NodeLink";
import React, { Component } from "react";

class Nodes extends Component {
  getNodes(workspace){
    return workspace.nodes.map((node) => (<NodeLink key={`node-${node.safeName}`} postgresPort={workspace.postgresPort} node={node} />));
  }

  getNotaries(workspace){
    return workspace.notaries.map((node) => (<NodeLink key={`node-${node.safeName}`} postgresPort={workspace.postgresPort} node={node} services={["Notary"]} />));
  }

  getEntities(){
    const workspace = this.props.config.settings.workspace;
    return this.getNodes(workspace).concat(this.getNotaries(workspace));
  }

  emptyNetwork(){
    return (<div className="Waiting Waiting-Padded">No nodes or notaries configured.</div>);
  }

  render() {
    const entities = this.getEntities();
    const isEmptyNetwork = entities.length === 0;
    return (
      <div className="Nodes DataRows">
        <main>
          {isEmptyNetwork ? this.emptyNetwork() : entities}
        </main>
      </div>
    );
  }
}

export default connect(
  Nodes,
  "config"
);
