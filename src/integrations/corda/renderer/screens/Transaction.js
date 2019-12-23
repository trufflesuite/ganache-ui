import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";
import jsonTheme from "../../../../common/utils/jsonTheme";
import ReactJson from "@ganache/react-json-view";
import NodeLink from "../components/NodeLink";
import { Link } from "react-router-dom";
import TransactionData from "../transaction-data";
import { CancellationToken } from "./utils";

const IGNORE_FIELDS = new Set(["@class", "participants"]);

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

    this.state = {selectedIndex: null, transaction: null, attachments: null, inputs: null, commands: null};
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
      this.setState({selectedIndex: null, transaction: null, attachments: null, inputs: null, commands: null}, this.refresh.bind(this));
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
    transaction.fetchDetails(nodes, port, false, canceller).then(async details => {
      if (canceller.cancelled) return;
      // we don't want to render attachments before the transaction is rendered...
      await updaterProm;
      if (canceller.cancelled) return;
      
      this.setState({attachments: details.attachments, commands: details.commands});
      
      // allow the tabs to render what we do know while we fetch the remaining details
      // from the other nodes
      this.setState({inputs: new Map(
        details.inputs.map((inState, index) => [index, {ref: {
          txhash: TransactionData.convertTransactionIdToHash(inState.txhash),
          index: inState.index
        }}])
      )});

      const promises = details.inputs.map(async (inState, index) => {
        const transaction = new TransactionData(TransactionData.convertTransactionIdToHash(inState.txhash));
        // TODO: this gets too much data... we only care about the single index,
        // not all of them. Also, we may be able to batch the requests by transaction
        // as multiple output states from a single previous transaction can be used
        // as input states for the next transaction
        await transaction.update(nodes, port, canceller);
        if (canceller.cancelled) return;
        const txStates = transaction.states;
        return [index, txStates.get(inState.index)];
      });
      const inputs = new Map(await Promise.all(promises));
      this.setState({inputs});
    });
  }

  renderStateHeader(state, type) {
    const index = state.ref.index;
    const txhash = state.ref.txhash;
    const txData = getCleanState(state);
    const meta = state.metaData;
    return (
      <div className="corda-details-section corda-transaction-details">
        <h3 className="Label">
          State {index} ({meta.status}) @ {meta.recordedTime}
          <div className="Label-rightAligned corda-transaction-classname">{state.state.contract}</div>
          {type === "Output" ? "" :
            <div className="corda-transaction-details-tx-link"><em>TX 
              <Link to={"/corda/transactions/" + txhash}>{txhash}</Link>
            </em></div>
          }
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
    );
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
    let selectedIndex = this.state.selectedIndex;
    let selectedState;
    [["Output", txStates], ["Input", this.state.inputs]].forEach(([type, states]) => {
      if (states === null) {
        tabs.push(<div style={{order: 9999999, cursor: "wait"}} ref={"tab_button_" + type + "_loading"} className="corda-tab Label">Loading {type} States...</div>);
        return;
      }
      for (let [index, state] of states) {
        const key = state.ref.txhash + state.ref.index;
        if (selectedIndex === null) {
          selectedIndex = key;
        }
        const order = (type==="Input" ? 1000 : 0) + index;
        tabs.push(<div style={{order}} ref={"tab_button_" + key} onClick={this.setState.bind(this, {selectedIndex: key}, undefined)} className={(selectedIndex === key ? "corda-tab-selected" : "") + " corda-tab Label"}>{type} State {index + 1}</div>);
        if (selectedIndex !== key) continue;
        if (!state.state) {
          selectedState = (<div className="Waiting Waiting-Padded">Loading State...</div>);
          continue;
        }

        const participants = state.state.data.participants || [];
        const workspaceNotary = this.getWorkspaceNotary(state.state.notary.owningKey);

        selectedState = (<div key={key}>
          {this.renderStateHeader(state, type)}
          
          {state.state.data.exitKeys && state.state.data.exitKeys.length !== 0 ? (
            <div className="corda-details-section">
              <h3 className="Label">Signers</h3>
              <div className="DataRows">
                {state.state.data.exitKeys.map(nodeKey => {
                  const workspaceNode = this.getWorkspaceNode(nodeKey);
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
              {participants.map((node, i) => {
                const workspaceNode = this.getWorkspaceNode(node.owningKey);
                if (workspaceNode) {
                  return (<NodeLink key={"participant_" + workspaceNode.safeName} postgresPort={this.props.config.settings.workspace.postgresPort} node={workspaceNode} />);
                } else {
                  return (<div className="DataRow" key={"participant_anon" + node.owningKey + i}><div className="Value"><em>Anonymized Participant</em></div></div>);
                }
              })}
            </div>
          </div>}

          {!state.observers.size ? "" :
            <div className="corda-details-section">
              <h3 className="Label">In Vault Of</h3>
              <div className="DataRows">
                {[...state.observers].map(node => {
                  return (<NodeLink key={"participant_" + node.safeName} postgresPort={this.props.config.settings.workspace.postgresPort} node={node} />);
                })}
              </div>
            </div>}
          </div>
        );
      }
    });

    let commands = null;
    if (this.state.commands === null){
      commands = (<div>Loading...</div>);
    } else if (this.state.commands.length === 0) {
      commands = (<div>No commands</div>);
    } else {
      commands = this.state.commands.map((command, i) => {
        return (<div style={{marginBottom:".5em"}} key={"command" + command.value["@class"] + i}>{command.value["@class"].split(".").map(d=>(<>{d}<div style={{display:"inline-block"}}>.</div></>))}</div>);
      });
    }

    let attachments = null;
    if (this.state.attachments === null){
      attachments = (<div>Loading...</div>);
    } else if (this.state.attachments.length === 0) {
      attachments = (<div>No attachments</div>);
    } else {
      attachments = this.state.attachments.map(attachment => {
        return (<div style={{marginBottom:".5em"}}  key={attachment.attachment_id}>{attachment.filename}</div>);
      });
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
            <div>
              <h3 className="Label">Commands</h3>
              <div>
                {commands}
              </div>
            </div>
            <div>
              <h3 className="Label">Attachments</h3>
              <div>
                {attachments}
              </div>
            </div>
          </div>
          <div className="DataRow corda-details-section corda-transaction-details-info">
            <div>
              <h3 className="Label">Timestamp</h3>
              <div>{transaction.earliestRecordedTime.toString()}</div>
            </div>
          </div>

          <div className="corda-tabs">
            {tabs}
          </div>
          {selectedState}
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
