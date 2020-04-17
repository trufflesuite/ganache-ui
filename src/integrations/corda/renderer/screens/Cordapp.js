import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import atob from "atob";
import NodeLink from "../components/NodeLink";
import TransactionLink from "../components/TransactionLink";
import TransactionData from "../transaction-data";
import { CancellationToken } from "./utils";
import { cordaNickname } from "../utils/nickname";
import DetailSection from "../components/DetailSection";

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
    const workspace = this.props.config.settings.workspace;
    return [...workspace.nodes, ...workspace.notaries].filter(node => (node.cordapps || []).includes(this.state.cordapp));
  }

  async refresh() {
    this.refresher.cancel();

    let canceller = this.refresher.getCanceller();

    const cordapp = this.state.cordapp;
    const settings = this.props.config.settings
    const workspace = settings.workspace;
    const port = workspace.postgresPort;
    const nodes = workspace.nodes;    
    const cordappHashMap = workspace.cordappHashMap;
    const filteredNodes = this.getNodes();
    const allTransactions = await TransactionData.getAllTransactions(filteredNodes, nodes, port, canceller);
    if (canceller.cancelled) return;
    await Promise.all(allTransactions.map(tx => {
      return tx.fetchDetails(nodes, port, cordappHashMap).then(details => {
        tx.details = details;
      })
    }));
    if (canceller.cancelled) return;
    const transactions = allTransactions.filter(({details}) => {
      if (details && details.commands && details.commands.length) {
        return details.commands.some(({contractFile}) => contractFile.includes(cordapp));
      }
      return false;
    });
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
      nickname: cordaNickname(cordapp)
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
          <DetailSection label="Installed On">
            {
              !nodes.length ? (<div className="Waiting Waiting-Padded">Not Installed</div>) :
                nodes.map(node => {
                  return (<NodeLink key={`node-${node.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={node} />);
                })
            }
          </DetailSection>

          <DetailSection label="Transactions">
            <main>{this.getTransactions()}</main>
          </DetailSection>
        </main>
      </section>    
    );
  }
}

export default connect(
  Cordapp,
  "config"
);
