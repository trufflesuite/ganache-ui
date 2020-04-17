import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import NodeLink from "../components/NodeLink";
import CordAppLink from "../components/CordAppLink";
import TransactionLink from "../components/TransactionLink";
import TransactionData from "../transaction-data";
import { CancellationToken } from "../screens/utils";
import { startNode } from "../../../../common/redux/config/actions";
import { cordaNickname } from "../utils/nickname";
import DetailSection from "../components/DetailSection";

function filterNodeBy(nodeToMatch) {
  return (node) => {
    return node.safeName === nodeToMatch;
  }
}

class NodeDetails extends Component {
  refresher = new CancellationToken();

  constructor(props) {
    super(props);

    this.state = {node: this.findNodeFromProps(), nodes:null, notaries:null, cordapps: null, transactions: null};
  }

  componentWillUnmount() {
    this.refresher.cancel();
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
      this.setState({node: this.findNodeFromProps(), nodes:null, notaries:null, cordapps:null, transactions: null}, this.refresh.bind(this));
    }
    if (prevProps.config.updated !== this.props.config.updated) {
      this.refresh();
    }
  }

  refresh() {
    this.refresher.cancel();

    let canceller = this.refresher.getCanceller();

    if (this.state.node) {
      const nodes = this.props.config.settings.workspace.nodes.filter(node => {
        return this.props.config.cordaNodeStatus[node.safeName] !== "stopped";
      });
      const postgresPort =  this.props.config.settings.workspace.postgresPort;

      const notariesProm = fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/network/notaries")
        .then(r => r.json())
        .then(json => {
          if(Array.isArray(json)) return json;
          return [];
        })

      notariesProm.then(notaries => {
        if (canceller.cancelled) return;
        notaries = notaries.filter(notary => {
          const workspaceNode = this.getWorkspaceNotary(notary.owningKey);
          return this.props.config.cordaNodeStatus[workspaceNode.safeName] !== "stopped";
        });
        this.setState({notaries});
      });

      fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/network/nodes")
        .then(r => r.json())
        .then(json => {
          if(Array.isArray(json)) return json;
          return [];
        })
        .then(async nodes => {
          if (canceller.cancelled) return;

          const selfName = this.state.node.name.replace(/\s/g, "");
          const notaries = await notariesProm;

          if (canceller.cancelled) return;
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
                if (!notariesMap.has(nodeIdent.owningKey)) {
                  const workspaceNode = this.getWorkspaceNode(nodeIdent.owningKey);
                  if (this.props.config.cordaNodeStatus[workspaceNode.safeName] !== "stopped") {
                    nodesMap.set(nodeIdent.owningKey, node);
                  }
                }
              }
            });
          });
          this.setState({nodes: [...nodesMap.values()]});
        });

      fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/cordapps")
        .then(r => r.json())
        .then(json => {
          if (canceller.cancelled) return;

          if(Array.isArray(json)) return json;
          return [];
        })
        .then(cordapps => this.setState({cordapps}));

      fetch("https://localhost:" + (this.state.node.braidPort) + "/api/rest/network/nodes/self")
        .then(r => r.json())
        .then(self => {
          if (canceller.cancelled) return;

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
            if (canceller.cancelled) return;

            if (json && Array.isArray(json.states)) return json;
            return [];
          })
          .then(json => {
            if (canceller.cancelled) return;

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
            if (canceller.cancelled) return;

            this.setState(state => {
              return {transactions: [...state.transactions || [], ...transactions]};
            });
          })
        });

      TransactionData.getConnectedClient(this.state.node.safeName, this.props.config.settings.workspace.postgresPort)
        .then(async client => {
          if (canceller.cancelled) return;

          try {
            return await client.query("SELECT transaction_id FROM node_notary_committed_txs");
          } finally {
            client.release();
          }
        }).then(async res => {
          if (canceller.cancelled) return;

          const proms = Promise.all(res.rows.map(row => {
            const tx = new TransactionData(TransactionData.convertTransactionIdToHash(row.transaction_id));
            return tx.update(nodes, postgresPort);
          }));
          
          const transactions = await proms;
          if (canceller.cancelled) return;

          this.setState(state => {
            return {transactions: [...(state.transactions || []), ...transactions]};
          });
        }).catch(e => {
          console.log("probably not a notary :-)", e);
        })
    }
  }

  getWorkspaceNode(owningKey){
    return this.props.config.settings.workspace.nodes.find(node => owningKey === node.owningKey);
  }

  getWorkspaceNotary(owningKey){
    return this.props.config.settings.workspace.notaries.find(notary => owningKey === notary.owningKey);
  }

  getWorkspaceCordapp(name) {
    return this.props.config.settings.workspace.projects.find(cordapp => cordaNickname(cordapp).endsWith(name.toLowerCase()));
  }

  getCordapps(){
    let cordapps = (<div className="Waiting Waiting-Padded">Loading CorDapps...</div>);
    if(this.state.cordapps) {
      cordapps = this.state.cordapps.reduce((acc, cordapp) => {
        const workspaceCordapp = this.getWorkspaceCordapp(cordapp);
        if (workspaceCordapp) {
          acc.push((<CordAppLink key={workspaceCordapp} cordapp={workspaceCordapp} workspace={this.props.config.settings.workspace}>{workspaceCordapp}</CordAppLink>));
        }
        return acc;
      }, []);
      if (cordapps.length === 0) {
        cordapps = (<div className="Waiting Waiting-Padded">No CorDapps</div>);
      }
    }
    return cordapps;
  }

  getConnectedNodes(){
    const loading = (<div className="Waiting Waiting-Padded">Loading Nodes &amp; Notaries...</div>);
    const noPeers = (<div className="Waiting Waiting-Padded">No Connected Nodes or Notaries</div>);
    let nodes = [];
    let hasNoPeers = (!!this.state.nodes && !!this.state.notaries);
    if (this.state.nodes) {
      nodes = this.state.nodes.reduce((acc, node) => {
        const owningKey = node.legalIdentities[0].owningKey
        // filter self
        if (this.state.node.owningKey === owningKey) return acc;

        const workspaceNode = this.getWorkspaceNode(owningKey);
        if (workspaceNode) {
          acc.push((<NodeLink key={`node-${workspaceNode.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={workspaceNode} />));
        }
        return acc;
      }, []);
    }
    if (this.state.notaries) {
      nodes = nodes.concat(this.state.notaries.reduce((acc, notary) => {
        const owningKey = notary.owningKey
        // filter self
        if (this.state.node.owningKey === owningKey) return acc;

         const workspaceNode = this.getWorkspaceNotary(notary.owningKey);
        if (workspaceNode && notary.owningKey !== this.state.node) {
          acc.push((<NodeLink key={`node-${workspaceNode.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={workspaceNode} services={["Notary"]} />));
        }
        return acc;
      }, []));
    }
    return nodes.length ? nodes : hasNoPeers ? noPeers : loading;
  }

  getTransactions(){
    let noTxsOrLoading;
    let txs;
    const seen = new Set();
    if (this.state.transactions){
      if (this.state.transactions.length === 0) {
        noTxsOrLoading = (<div className="Waiting Waiting-Padded">No Transactions</div>);
      } else {
        txs = this.state.transactions.sort((a, b) => b.earliestRecordedTime - a.earliestRecordedTime).map(transaction => {
          if (seen.has(transaction.txhash)){
            return
          }
          seen.add(transaction.txhash);
          return (<TransactionLink key={transaction.txhash} tx={transaction} />);
        });
      }
    } else {
      noTxsOrLoading = (<div className="Waiting Waiting-Padded">Loading Transactions...</div>);
    }
    return txs ? txs : noTxsOrLoading;
  }

  render() {
    const node = this.state.node;
    if (!node) {
      return (<div className="Waiting Waiting-Padded">Couldn&apos;t locate node: {this.props.match.params.node}</div>);
    }

    let restartButton = <></>;
    const status = this.props.config.cordaNodeStatus[node.safeName];
    const style = {
      position: "absolute",
      right: "1.5rem",
      top: "5%",
      transform: "translateY(-50%)"
    };
    if (status === "stopped") {
      restartButton = (<span style={style}>
        <span>Node is stopped!</span> <button style={{marginLeft: "1rem", padding:"1em"}} onClick={()=>this.props.dispatch(startNode(node.safeName))}>Restart</button>
      </span>);
    } else if (status === "starting") {
      restartButton = (<span style={style}>
        <span>Node is starting...</span>
      </span>);
    }

    return (
      <section className="BlockCard" style={{height: "100%"}}>
        <header>
          <button className="Button" onClick={this.props.history.goBack}>
            &larr; Back
          </button>
          <h1 className="Title">
            {node.name}(Corda {(node.version || "4_4").replace("_", ".")}) {restartButton}
          </h1>
        </header>
        <main className="corda-details-container corda-node-details">
          <DetailSection label={<span>Connection Details</span>}>
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
              <div>
                <div className="Label">SSHD Port</div>
                <div className="Value">{node.sshdPort}</div>
              </div>
            </div>
            <div className="DataRow corda-node-details-ports corda-details-section corda-details-padded">
              <div>
                <div className="Label">Username</div>
                <div className="Value">user1</div>
              </div>
              <div>
                <div className="Label">Password</div>
                <div className="Value">letmein</div>
              </div>
            </div>
            <div className="DataRow corda-details-section corda-details-padded">
              <div>
                <div className="Label">Postgres Connection</div>
                <div className="Value">postgresql://corda@localhost:{this.props.config.settings.workspace.postgresPort}/{node.safeName}</div>
              </div>
            </div> 
          </DetailSection>

          <DetailSection label="CorDapps">
            <main>{this.getCordapps()}</main>
          </DetailSection>

          <DetailSection label="Connected Nodes &amp; Notaries">
            <main>{this.getConnectedNodes()}</main>
          </DetailSection>

          <DetailSection label="Recent Transaction">
              <main>{this.getTransactions()}</main>
          </DetailSection>
        </main>
      </section>
    );
  }
}

export default connect(
  NodeDetails,
  "config"
);
