import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";
import TransactionStates from "../components/TransactionStates";
import TransactionAttachments from "../components/TransactionAttachments";
import TransactionCommands from "../components/TransactionCommands";
import TransactionData from "../transaction-data";
import { CancellationToken } from "./utils";

class Transaction extends Component {
  refresher = new CancellationToken();

  constructor(props) {
    super(props);

    this.state = {transaction: null, attachments: null, inputs: null, commands: null, cordapps: null};
  }

  componentWillUnmount() {
    this.refresher.cancel();
  }

  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.config.updated !== this.props.config.updated) {
      // if the data has updated let's refresh the transaction just in case
      // things have changed.
      this.refresh();
    } else if (prevProps.match.params.txhash !== this.props.match.params.txhash) {
      // if the txhash has changed we first want to trigger the loading screen
      // by getting rid of the current `transaction` then we need to refresh our data
      this.setState({transaction: null, attachments: null, inputs: null, commands: null, cordapps: null}, this.refresh.bind(this));
    }
  }

  async refresh() {
    this.refresher.cancel();

    let canceller = this.refresher.getCanceller();
    
    const cordappHashMap = this.props.config.settings.workspace.cordappHashMap;
    const port = this.props.config.settings.workspace.postgresPort;
    const nodes = this.props.config.settings.workspace.nodes;
    const txhash = this.props.match.params.txhash;

    const transaction = new TransactionData(txhash);
    const updaterProm = transaction.update(nodes, port, canceller).then(() => {
      if (canceller.cancelled) return;
      this.setState({transaction});
    });
    transaction.fetchDetails(nodes, port, cordappHashMap).then(async details => {
      if (canceller.cancelled) return;
      // we don't want to render attachments before the transaction is rendered...
      await updaterProm;
      if (canceller.cancelled) return;
      
      this.setState({attachments: details.attachments, commands: details.commands});
      
      // allow the tabs to render what we do know while we fetch the remaining details
      // from the other nodes
      this.setState({inputs: new Map(
        details.inputs.map((inState, index) => [index + 1, {ref: {
          txhash: TransactionData.convertTransactionIdToHash(inState.txhash),
          index: inState.index
        }}])
      )});

      const statePromises = details.inputs.map(async (inState, index) => {
        const transaction = new TransactionData(TransactionData.convertTransactionIdToHash(inState.txhash));
        // TODO: this gets too much data... we only care about the single index,
        // not all of them. Also, we may be able to batch the requests by transaction
        // as multiple output states from a single previous transaction can be used
        // as input states for the next transaction
        await transaction.update(nodes, port, canceller);
        if (canceller.cancelled) return;
        const txStates = transaction.states;
        return [index + 1, txStates.get(inState.index)];
      });
      Promise.all(statePromises).then(results => {
        const inputs = new Map(results);
        this.setState({inputs});
      })
    });
  }

  render() {
    const transaction = this.state.transaction;
    if (!transaction) {
      return (<div className="Waiting Waiting-Padded">Loading Transaction...</div>);
    }

    const txStates = transaction.states;
    if (txStates.size === 0) {
      return (<div className="Waiting Waiting-Padded">Couldn&apos;t locate transaction {this.props.match.params.txhash}</div>);
    }

    return (
      <section className="BlockCard" style={{minHeight:"100%"}}>
        <header>
          <button className="Button" onClick={this.props.history.goBack}>
            &larr; Back
          </button>
          <h1 className="Title">
          TX {transaction.txhash}
          </h1>
        </header>
        <main className="corda-details-container">
          <div className="DataRow corda-details-section corda-transaction-details-info">
            <TransactionCommands commands={this.state.commands} />
            <TransactionAttachments attachments={this.state.attachments} />
          </div>
          <div className="DataRow corda-details-section corda-transaction-details-info">
            <div>
              <h3 className="Label">Timestamp</h3>
              <div>{transaction.earliestRecordedTime.toString()}</div>
            </div>
          </div>

          <TransactionStates postgresPort={this.props.config.settings.workspace.postgresPort} nodes={this.props.config.settings.workspace.nodes} notaries={this.props.config.settings.workspace.notaries} transaction={transaction} inputs={this.state.inputs} />
        </main>
      </section>
    );
  }
}

export default connect(
  Transaction,
  "config"
);
