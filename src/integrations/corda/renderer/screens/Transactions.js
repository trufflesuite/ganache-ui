import connect from "../../../../renderer/screens/helpers/connect";

import { push } from "react-router-redux";
import React, { Component } from "react";

class Transactions extends Component {
  componentDidMount(){
    this.refresh();
  }

  refresh() {
    this.props.config.settings.workspace.nodes.forEach((node) => {
      fetch("http://localhost:" + (node.rpcPort + 10000) + "/api/rest/vault/vaultQuery", {
        headers: {
          "accept": "application/json"
        }
      }).then(res => res.json())
      .then((json) => {
        console.log(json);
        console.log(node.safeName);
        this.setState({["node_" + node.safeName]: json});
      })
    })
  }
  constructor(props) {
    super(props);

    const state = {
      selectedNode: ""
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
    return (
      <div className="Nodes DataRows">
        <main>
          <select defaultValue={this.state.selectedNode} onChange={(e) => {this.setState({"selectedNode": e.target.value})}}>
            <option value="">All nodes</option>
            {workspace.nodes.map((node) => {
              return <option key={node.safeName} value={node.safeName}>{node.name}</option>
            })}
          </select>
          {filteredNodes.map((node) => {
            const txData = this.state["node_" + node.safeName]
            if (txData && txData.states) {
              return txData.states.map((state) => {
                const goToTransactionDetails = () => {
                  this.props.dispatch(
                    push(`/corda/transactions/${state.ref.txhash}`),
                  );
                }
                  
                if (seenTxs.has(state.ref.txhash)) return;
                seenTxs.add(state.ref.txhash);

                return (
                  <div onClick={goToTransactionDetails} key={state.ref.txhash}>
                      <div>
                        <div>ID</div>
                        <div>{state.ref.txhash}</div>
                      </div>
                      <div>
                        <div>Participants</div>
                        <div>
                          {state.state.data.participants.map(node => (
                            <div key={node.name}>{node.name}</div>
                          ))}
                        </div>
                      </div>
                  </div>
                );
              });
            } else {
              return null;
            }
          })}
        </main>
      </div>
    );
  }
}

export default connect(
  Transactions,
  "config"
);
