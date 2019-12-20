import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import NodeLink from "../components/NodeLink";
import CordAppLink from "../components/CordAppLink";
import TransactionLink from "../components/TransactionLink";
import TransactionData from "../transaction-data";

// this is taken from braid
const VERSION_REGEX = /^(.*?)(?:-(?:(?:\d|\.)+))\.jar?$/;

function filterNodeBy(nodeToMatch) {
  return (node) => {
    return node.safeName === nodeToMatch;
  }
}

class NodeDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {node: this.findNodeFromProps(), nodes:[], notaries:[], cordapps:[], transactions: []};
  }

  findNodeFromProps(){
    const workspace = this.props.config.settings.workspace;
    const isNode = filterNodeBy(this.props.match.params.node);
    let matches = [...workspace.nodes, ...workspace.notaries].filter(isNode);
    return matches[0] || null;
  }

  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.node !== this.props.match.params.node) {
      this.setState({node: this.findNodeFromProps(), nodes:[], notaries:[], cordapps:[], transactions: []}, this.refresh.bind(this));
    }
    if (prevProps.config.updated !== this.props.config.updated) {
      this.refresh();
    }
  }

  refresh() {
    if (this.state.node) {
      const notariesProm = fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/network/notaries")
        .then(r => r.json());

      notariesProm.then(notaries => this.setState({notaries}));

      fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/network/nodes")
        .then(r => r.json())
        .then(async nodes => {
          const selfName = this.state.node.name.replace(/\s/g, "");
          const notaries = await notariesProm;
          const notariesMap = new Set(notaries.map(notary => notary.owningKey));
          const nodesMap = new Map();
          nodes.forEach(node => {
            return node.legalIdentities.some(nodeIdent => {
              // braid sometimes returns the same node multiple times
              if (nodesMap.has(nodeIdent.owningKey)) return;

              // filter out self
              if (nodeIdent.name.replace(/\s/g,"") === selfName) {
                return false;
              } else {
                // filter out notaries
                if(!notariesMap.has(nodeIdent.owningKey)){
                  nodesMap.set(nodeIdent.owningKey, node);
                }
              }
            });
          });
          this.setState({nodes: [...nodesMap.values()]});
        });

      fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/cordapps")
        .then(r => r.json())
        .then(cordapps => this.setState({cordapps}));

      fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/network/nodes/self")
        .then(r => r.json())
        .then(self => {
          fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/vault/vaultQueryBy", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "content-type": "application/json"
            },
            body: JSON.stringify({
              "criteria" : {
                "@class" : ".QueryCriteria$VaultQueryCriteria",
                "status" : "ALL",
                "participants" : self.legalIdentities
              }
            })
          })
          .then(res => res.json())
          .then(json => {
            const nodes = this.props.config.settings.workspace.nodes;
            const postgresPort =  this.props.config.settings.workspace.postgresPort;
            const transactionPromises = [];
            const hashes = new Set();
            json.states.forEach(state => {
              hashes.add(state.ref.txhash);
            });
            hashes.forEach(hash => {
              const tx = new TransactionData(hash);
              transactionPromises.push(tx.update(nodes, postgresPort));
            })
            return Promise.all(transactionPromises);
          }).then(transactions => {
            this.setState({transactions});
          })
        });
    }
  }

  getWorkspaceNode(owningKey){
    return this.props.config.settings.workspace.nodes.find(node => owningKey === node.owningKey);
  }

  getWorkspaceNotary(owningKey){
    return this.props.config.settings.workspace.notaries.find(notary => owningKey === notary.owningKey);
  }

  getWorkspaceCordapp(name) {
    return this.props.config.settings.workspace.projects.find(cordapp => VERSION_REGEX.exec(cordapp)[1].toLowerCase().endsWith(name.toLowerCase()));
  }

  render() {
    const node = this.state.node;
    if (!node) {
      return (<div>Couldn&apos;t locate node {this.props.match.params.node}</div>);
    }

    return (
      <section className="BlockCard">
        <header>
          <button className="Button" onClick={this.props.history.goBack}>
            &larr; Back
          </button>
          <h1 className="Title">
            {node.name}
          </h1>
        </header>
        <main className="corda-details-container corda-node-details">
          <div className="DataRow corda-node-details-ports corda-details-section corda-details-padded">
            <div>
              <div className="Label">RPC Port</div>
              <div className="Value">{node.rpcPort}</div>
            </div>
            <div>
              <div className="Label">P2P Port</div>
              <div className="Value">{node.p2pPort}</div>
            </div>
            <div>
              <div className="Label">Admin Port</div>
              <div className="Value">{node.adminPort}</div>
            </div>
          </div>
          <div className="corda-details-section corda-details-padded">
            <div>
              <div className="Label">Postgres Connection</div>
              <div className="Value">postgresql://corda@localhost:{this.props.config.settings.workspace.postgresPort}/{node.safeName}</div>
            </div>
          </div>

          <div className="corda-details-section corda-details-invert-colors">
            <div className="Label">CorDapps</div>
            <div className="Nodes DataRows">
              <main>
                {this.state.cordapps.map(cordapp => {
                  const workspaceCordapp = this.getWorkspaceCordapp(cordapp);
                  if (workspaceCordapp) {
                    return (<CordAppLink key={workspaceCordapp} cordapp={workspaceCordapp} workspace={this.props.config.settings.workspace}>{workspaceCordapp}</CordAppLink>);
                  }
                })}
                {this.state.cordapps.length ? "" : <div>No CorDapps</div>}
              </main>
            </div>
          </div>

          <div className="corda-details-section">
            <div className="Label">Connected Nodes</div>
            <div className="Nodes DataRows">
              <main>
                {this.state.nodes.map(node => {
                  const workspaceNode = this.getWorkspaceNode(node.legalIdentities[0].owningKey);
                  if (workspaceNode) {
                    return (<NodeLink key={`node-${workspaceNode.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={workspaceNode} />);
                  } else {
                    return ("");
                  }
                })}
                {this.state.notaries.map(notary => {
                  if (notary.owningKey === this.state.node) return;

                  const workspaceNode = this.getWorkspaceNotary(notary.owningKey);
                  if (workspaceNode) {
                    return (<NodeLink key={`node-${workspaceNode.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={workspaceNode} services={["Notary"]} />);
                  }
                })}
              </main>
            </div>
          </div>

          <div className="corda-details-section corda-details-invert-colors">
            <div className="Label">Transactions</div>
            <div className="Nodes DataRows">
              <main>
                {this.state.transactions.sort((a, b) => b.earliestRecordedTime - a.earliestRecordedTime).map(transaction => {
                  return (<TransactionLink key={transaction.txhash} tx={transaction} />);
                })}
                {this.state.transactions.length ? "" : <div>No Transactions</div>}
              </main>
            </div>
          </div>

        </main>
      </section>
    );
  }
}

export default connect(
  NodeDetails,
  "config"
);
