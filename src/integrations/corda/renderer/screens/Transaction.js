import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";
import jsonTheme from "../../../../common/utils/jsonTheme";
import ReactJson from "@ganache/react-json-view";
import NodeLink from "../components/NodeLink";
import TransactionData from "../transaction-data";
import { CancellationToken } from "./utils";

const IGNORE_FIELDS = new Set(["@class", "participants"]);
// const IGNORE_FIELDS = new Set(["@class", "participants", "linearId"]);

function getCleanState(state) {
  const data = state.state.data;
  const cleanState = {};
  for (const key in data) {
    if (IGNORE_FIELDS.has(key)) continue;
    cleanState[key] = data[key];
  }
  return cleanState;
}

class Transaction extends Component {
  refresher = new CancellationToken();

  constructor(props) {
    super(props);

    this.state = {selectedIndex: 0, transaction: null, attachments: null};
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
      this.setState({transaction: null, attachments: null}, this.refresh.bind(this));
    }
  }

  async refresh() {
    // I not ready to commit to redux thunks for this stuff just yet
    // so a little async canceller will have to do
    this.refresher.cancel();

    let canceller = this.refresher.getCanceller();
    
    const port = this.props.config.settings.workspace.postgresPort;
    const nodes = this.props.config.settings.workspace.nodes;
    const txhash = this.props.match.params.txhash;

    const transaction = new TransactionData(txhash);
    const updaterProm = transaction.update(nodes, port, canceller).then(() => {
      if (canceller.cancelled) return;
      this.setState({transaction});
    });
    transaction.fetchAttachments(nodes, port, false, canceller).then(async attachments => {
      if (canceller.cancelled) return;
      // we don't want to render attachments before the transaction is rendered...
      await updaterProm;
      if (canceller.cancelled) return;

      this.setState({attachments});
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

    const tabs = [];
    const states = [];
    for (let [index, state] of txStates) {
      const txData = getCleanState(state);

      const participants = state.state.data.participants || [];
      const workspaceNotary = this.getWorkspaceNotary(state.state.notary.owningKey);
      const meta = state.metaData;
      tabs[index] = (<div onClick={this.setState.bind(this, {selectedIndex: index}, undefined)} className={(this.state.selectedIndex === index ? "corda-tab-selected" : "") + " corda-tab Label"}>Index {index}</div>);
      if (this.state.selectedIndex !== index) continue;
      states.push(<div key={state + index}>
        <div className="corda-details-section corda-transaction-details">
          <h3 className="Label">
            State {index} ({meta.status}) @ {meta.recordedTime}
            <div className="Label-rightAligned">{state.state.contract}</div>
          </h3>
          <div className="Nodes DataRows corda-json-view">
            <ReactJson
              src={
                txData
              }
              name={false}
              theme={jsonTheme}
              iconStyle="triangle"
              edit={false}
              add={false}
              delete={false}
              enableClipboard={true}
              displayDataTypes={true}
              displayObjectSize={true}
              indentWidth={4}// indent by 4 because that's what Corda likes to do.
              collapsed={1}
              collapseStringsAfterLength={36}
            />
          </div>
        </div>
        
        {state.state.data.exitKeys && state.state.data.exitKeys.length !== 0 ? (
          <div className="corda-details-section">
            <h3 className="Label">Signers</h3>
            <div className="DataRows">
              {state.state.data.exitKeys.map(key => {
                const workspaceNode = this.getWorkspaceNode(key);
                if (workspaceNode) {
                  return (<NodeLink key={"participant_" + workspaceNode.safeName} postgresPort={this.props.config.settings.workspace.postgresPort} node={workspaceNode} />);
                }
              })}
            </div>
          </div>
        ) : ("")}
        {!workspaceNotary ? "" :
          <div className="corda-details-section">
            <h3 className="Label">Notary</h3>
            <div className="DataRows">{<NodeLink node={workspaceNotary} postgresPort={this.props.config.settings.workspace.postgresPort} />}</div>
          </div>
        }

        {!participants.length ? "" :
        <div className="corda-details-section">
          <h3 className="Label">Participants</h3>
          <div className="DataRows">
            {participants.map(node => {
              const workspaceNode = this.getWorkspaceNode(node.owningKey);
              if (workspaceNode) {
                return (<NodeLink key={"participant_" + workspaceNode.safeName} postgresPort={this.props.config.settings.workspace.postgresPort} node={workspaceNode} />);
              } else {
                return (<div className="DataRow" key={"participant_anon" + node.owningKey}><div className="Value"><em>Anonymized Participant</em></div></div>);
              }
            })}
          </div>
        </div>}

        {!state.observers.size ? "" :
          <div className="corda-details-section">
            <h3 className="Label">Known By</h3>
            <div className="DataRows">
              {[...state.observers].map(node => {
                return (<NodeLink key={"participant_" + node.safeName} postgresPort={this.props.config.settings.workspace.postgresPort} node={node} />);
              })}
            </div>
          </div>}
        </div>
      );
    }
    let attachments = null;
    if (this.state.attachments === null){
      attachments = (<div>Loading...</div>);
    } else if (this.state.attachments.length === 0) {
      attachments = (<div>No attachments</div>);
    } else {
      attachments = this.state.attachments.map(attachment => {
        return (<div key={attachment.attachment_id}>{attachment.filename}</div>);
      });
    }

    return (
      <section className="BlockCard">
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
            <div>
              <h3 className="Label">Timestamp</h3>
              <div>{transaction.earliestRecordedTime.toString()}</div>
            </div>
            <div>
              <h3 className="Label">Attachments</h3>
              <div>
                {attachments}
              </div>
            </div>
          </div>

          <div className="corda-tabs">
            {tabs}
          </div>
          {states}
        </main>
      </section>
    );
  }
  getWorkspaceNodeByType(type, owningKey) {
    return this.props.config.settings.workspace[type].find(node => owningKey === node.owningKey);
  }
  getWorkspaceNode(owningKey) {
    return this.getWorkspaceNodeByType("nodes", owningKey);
  }
  getWorkspaceNotary(owningKey) {
    return this.getWorkspaceNodeByType("notaries", owningKey);
  }
}

export default connect(
  Transaction,
  "config"
);
