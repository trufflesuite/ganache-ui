import connect from "../../../../renderer/screens/helpers/connect";

import { hashHistory } from "react-router";
import React, { Component } from "react";

function filterNodeBy(nodeToMatch) {
  return (node) => {
    return node.safeName === nodeToMatch;
  }
}

class Node extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const workspace = this.props.config.settings.workspace;
    const isNode = filterNodeBy(this.props.params.node);
    let matches = [...workspace.nodes, ...workspace.notaries].filter(isNode);
    let node;
    if (matches.length > 0) {
      node = matches[0];
    } else {
      return (<div>Couldn&apos;t locate node {this.props.params.node}</div>);
    }

    return (
      <div>
        <main>
          <button className="Button" onClick={hashHistory.goBack}>
            &larr; Back
          </button>
          <div>
            Node/Notary (&lt;- todo) {node.name}
          </div>
        </main>
      </div>
    );
  }
}

export default connect(
  Node,
  "config"
);
