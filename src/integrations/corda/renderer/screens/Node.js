import connect from "../../../../renderer/screens/helpers/connect";

import { hashHistory } from "react-router";
import React, { Component } from "react";
import { push } from "react-router-redux";

function filterNodeBy(nodeToMatch) {
  return (node) => {
    return node.safeName === nodeToMatch;
  }
}

class Node extends Component {
  constructor(props) {
    super(props);

    this.state = {node: this.findNodeFromProps(), nodes:[], notaries:[], cordapps:[], transactions: {}};
  }

  findNodeFromProps(){
    const workspace = this.props.config.settings.workspace;
    const isNode = filterNodeBy(this.props.params.node);
    let matches = [...workspace.nodes, ...workspace.notaries].filter(isNode);
    return matches[0] || null;
  }

  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.node !== this.props.params.node) {
      this.setState({node: this.findNodeFromProps(), nodes:[], notaries:[], cordapps:[], transactions: {}}, this.refresh.bind(this));
    }
  }

  refresh() {
    if (this.state.node) {
      fetch("https://localhost:" + (this.state.node.rpcPort + 10000) + "/api/rest/network/nodes")
        .then(r => r.json())
        .then(nodes => this.setState({nodes}));

      fetch("https://localhost:" + (this.state.node.rpcPort + 10000) + "/api/rest/network/notaries")
        .then(r => r.json())
        .then(notaries => this.setState({notaries}));

      fetch("https://localhost:" + (this.state.node.rpcPort + 10000) + "/api/rest/cordapps")
        .then(r => r.json())
        .then(cordapps => this.setState({cordapps}));

      fetch("https://localhost:" + (this.state.node.rpcPort + 10000) + "/api/rest/network/nodes/self")
        .then(r => r.json())
        .then(self => {
          fetch("https://localhost:" + (this.state.node.rpcPort + 10000) + "/api/rest/vault/vaultQueryBy", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "content-type": "application/json"
            },
            body: JSON.stringify({
              "criteria" : {
                "@class" : ".QueryCriteria$VaultQueryCriteria",
                "status" : "UNCONSUMED",
                // "contractStateTypes" : null,
                // "stateRefs" : [{txhash: this.props.params.txhash}],
                // "notary" : null,
                // "softLockingCondition" : null,
                // "timeCondition" : {
                //   "type" : "RECORDED",
                //   "predicate" : {
                //     "@class" : ".ColumnPredicate${'$'}Between",
                //     "rightFromLiteral" : "2019-09-15T12:58:23.283Z",
                //     "rightToLiteral" : "2019-10-15T12:58:23.283Z"
                //   }
                // },
                // "relevancyStatus" : "ALL",
                // "constraintTypes" : [ ],
                // "constraints" : [ ],
                "participants" : self.legalIdentities
              },
              // "paging" : {
              //   "pageNumber" : -1,
              //   "pageSize" : 200
              // },
              // "sorting" : {
              //   "columns" : [ ]
              // },
              // "contractStateType" : "net.corda.core.contracts.ContractState"
            })
          })
          .then(res => res.json())
          .then(transactions => this.setState({transactions}))
        });
    }
  }

  getWorkspaceNode(legalName){
    return this.props.config.settings.workspace.nodes.find(node => legalName.replace(/\s/g, "") === node.name.replace(/\s/g,""));
  }

  render() {
    if (!this.state.node) {
      return (<div>Couldn&apos;t locate node {this.props.params.node}</div>);
    }

    const transactionStates = this.state.transactions.states ? this.state.transactions.states : [];

    return (
      <div>
        <main>
          <button className="Button" onClick={hashHistory.goBack}>
            &larr; Back
          </button>
          <div>
            Node/Notary (&lt;- todo) {this.state.node.name}
            <hr />

            <div>Nodes</div>
            {this.state.nodes.filter(n => n.legalIdentities[0].name !== n.name).map(node => {
              const workspaceNode = this.getWorkspaceNode(node.legalIdentities[0].name);
              if (workspaceNode) {
                const goToNodeDetails = () => {
                  this.props.dispatch(
                    push(`/corda/nodes/${workspaceNode.safeName}`),
                  );
                }
                return (<div key={workspaceNode.safeName} onClick={goToNodeDetails} className="click">{node.legalIdentities[0].name}</div>);
              } else {
                return (<div key={node.legalIdentities[0].name} className="noclick">{node.legalIdentities[0].name}</div>);
              }
            })}
            <hr />

            <div>Notaries</div>
            {this.state.notaries.map(notary => {
              return (<div key={notary.name}>{notary.name}</div>);
            })}
            <hr />

            <div>CorDapps</div>
            {this.state.cordapps.map(cordapp => {
              const goToCorDappDetails = () => {
                this.props.dispatch(
                  push(`/corda/cordapps`),
                );
              }
              return (<div onClick={goToCorDappDetails} key={cordapp}>{cordapp}</div>);
            })}
            <hr />

            <div>Transactions</div>
            {transactionStates.map(transaction => {
              return (<div key={transaction.ref.txhash}>{transaction.ref.txhash}</div>);
            })}

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
