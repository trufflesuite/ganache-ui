import connect from "../../../../renderer/screens/helpers/connect";

import TransactionLink from "../components/TransactionLink";
import React, { Component } from "react";
import TransactionData from "../transaction-data";

class Transactions extends Component {
  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.config.updated !== this.props.config.updated) {
      this.refresh();
    }
  }

  async refresh() {
    const nodes = this.props.config.settings.workspace.nodes;    
    const transactions = await TransactionData.getAllTransactions(nodes, nodes, this.props.config.settings.workspace.postgresPort);
    this.setState({transactions});
  }
  constructor(props) {
    super(props);

    const state = {
      selectedNode: "",
      transactions: []
    };
    this.props.config.settings.workspace.nodes.forEach((node) => {
      state["node_" + node.safeName] = {};
    });
    this.state = state;
  }

  render() {
    const workspace = this.props.config.settings.workspace;
    const filteredNodes = this.state.selectedNode !== "" ? workspace.nodes.filter(node => node.safeName === this.state.selectedNode) : workspace.nodes;
    const seenTxs = new Set();
    const txData = {states:[], statesMetadata: []};
    filteredNodes.forEach((node) => {
      const nodeData = this.state["node_" + node.safeName];
      if (nodeData && nodeData.states) {
        nodeData.states.forEach((state, i) => {
          if (seenTxs.has(state.ref.txhash + "/" + state.ref.index)) return;
          seenTxs.add(state.ref.txhash + "/" + state.ref.index);
          state._node = node;
          txData.states.push(state);
          txData.statesMetadata.push(nodeData.statesMetadata[i]);
        });
      }
    })
    return (
      <div>
        <select defaultValue={this.state.selectedNode} onChange={(e) => {this.setState({"selectedNode": e.target.value})}}>
          <option value="">All nodes</option>
          {workspace.nodes.map((node) => {
            return <option key={node.safeName} value={node.safeName}>{node.name}</option>
          })}
        </select>
        <div className="Nodes DataRows">
          <main>
              {this.state.transactions.sort((a, b) => b.recordedTime - a.recordedTime).map(tx => {
                return (<TransactionLink key={tx.txhash} tx={tx} />);
              })}
          </main>
        </div>
      </div>
    );
  }
}

export default connect(
  Transactions,
  "config"
);
