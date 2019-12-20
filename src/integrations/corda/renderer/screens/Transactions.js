import connect from "../../../../renderer/screens/helpers/connect";

import TransactionLink from "../components/TransactionLink";
import React, { Component } from "react";
import TransactionData from "../transaction-data";

class Transactions extends Component {
  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.config.updated !== this.props.config.updated || prevState.selectedNode !== this.state.selectedNode) {
      this.refresh();
    }
  }

  async refresh() {
    const workspace = this.props.config.settings.workspace;
    const nodes = workspace.nodes;    
    const filteredNodes = this.state.selectedNode !== "" ? nodes.filter(node => node.safeName === this.state.selectedNode) : nodes;
    const transactions = await TransactionData.getAllTransactions(filteredNodes, nodes, workspace.postgresPort);
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
    return (
      <div className="corda-transactions">
        <div className="corda-transactions-filter">
          <div className="corda-transactions-label">Filter</div>
          <div className="StyledSelect">
            <select defaultValue={this.state.selectedNode} onChange={(e) => {this.setState({"selectedNode": e.target.value})}}>
              <option value="">All nodes</option>
              {workspace.nodes.map((node) => {
                return <option key={node.safeName} value={node.safeName}>{node.name}</option>
              })}
            </select>
          </div>
        </div>
        <div className="Nodes DataRows">
          <main>
              {this.state.transactions.sort((a, b) => b.earliestRecordedTime - a.earliestRecordedTime).map(tx => {
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
