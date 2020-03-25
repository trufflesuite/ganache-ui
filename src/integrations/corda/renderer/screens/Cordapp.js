import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import atob from "atob";
import { basename } from "path"
import NodeLink from "../components/NodeLink";
import TransactionLink from "../components/TransactionLink";
import TransactionData from "../transaction-data";
import { CancellationToken } from "./utils";

// this is taken from braid
const VERSION_REGEX = /^(.*?)(?:-(?:(?:\d|\.)+))\.jar?$/;

class Cordapp extends Component {
  refresher = new CancellationToken();

  constructor(props) {
    super(props);
    this.state = Cordapp.getStateFromProps(this.props);
  }

  componentDidMount(){
    this.refresh();
  }

  componentWillUnmount() {
    this.refresher.cancel();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.cordapp !== this.props.match.params.cordapp) {
      this.setState(Cordapp.getStateFromProps(this.props), this.refresh.bind(this));
    }
    if (prevProps.config.updated !== this.props.config.updated) {
      this.refresh();
    }
  }

  getNodes(){
    return this.props.config.settings.workspace.nodes.filter(node => node.cordapps.includes(this.state.cordapp))
  }

  async refresh() {
    this.refresher.cancel();

    let canceller = this.refresher.getCanceller();

    const workspace = this.props.config.settings.workspace;
    const nodes = workspace.nodes;    
    const filteredNodes = this.getNodes();
    const transactions = await TransactionData.getAllTransactions(filteredNodes, nodes, workspace.postgresPort, canceller);
    if (canceller.cancelled) return;
    this.setState({transactions});
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

  static getStateFromProps(props) {
    const cordapp = atob(props.match.params.cordapp);
    return {
      cordapp,
      nickname: VERSION_REGEX.exec(basename(cordapp))[1].toLowerCase()
    };
  }

  static getDerivedStateFromProps(props) {
    return Cordapp.getStateFromProps(props);
  }

  render() {
    const cordapp = this.state.cordapp;
    const nodes = this.getNodes();

    return (
      <section className="BlockCard">
        <header>
          <button className="Button" onClick={this.props.history.goBack}>
            &larr; Back
          </button>
          <h1 className="Title">
            {this.state.nickname}
          </h1>
        </header>
        <main>
          <div className="DataRow corda-details-section corda-details-padded">
            <div>
                <div className="Label">Path</div>
                <div className="Value">{cordapp}</div>
            </div>
          </div>
          <div className="corda-details-section">
            <h3 className="Label">Installed On</h3>
            <div className="Nodes DataRows">
              <main>
                {nodes.map(node => {
                  return (<NodeLink key={`node-${node.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={node} />);
                })}
              </main>
            </div>
          </div>

          <div className="corda-details-section">
            <h3 className="Label">Transactions</h3>
            <div className="Nodes DataRows">
              <main>{this.getTransactions()}</main>
            </div>
          </div>
        </main>
      </section>    
    );
  }
}

export default connect(
  Cordapp,
  "config"
);
