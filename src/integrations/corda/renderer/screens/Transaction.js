import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import { hashHistory } from "react-router";

import jsonTheme from "../../../../common/utils/jsonTheme";
import ReactJson from "@seesemichaelj/react-json-view";

import NodeLink from "../components/NodeLink";

class Transaction extends Component {
  componentDidMount(){
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.config.updated !== this.props.config.updated) {
      this.refresh();
    }
  }

  refresh() {
    const node = this.props.config.settings.workspace.nodes.find(node => node.safeName === this.props.params.node);
    if (!node) {
      this.setState({results: []});
      return;
    }
    const request = fetch("https://localhost:" + (node.rpcPort + 10000) + "/api/rest/vault/vaultQueryBy", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          "criteria" : {
            "@class" : ".QueryCriteria$VaultQueryCriteria",
            "status" : "ALL",
            "stateRefs" : [{txhash: this.props.params.txhash, index: parseInt(this.props.params.index || 0, 10)}]
          }
        })
      })
      .then(res => res.json());
    return request.then(result => {
      this.setState({result})
    });
  }
  constructor(props) {
    super(props);

    this.state = {result:null};
  }

  getCleanStates(states) {
    const ignoreFields = ["@class", "participants", "linearId"];
    return states.map(({state}) => Object.keys(state.data).reduce((acc, key) => {
      if(!ignoreFields.includes(key)) {
        acc[key] = state.data[key];
      }
      return acc;
    }, {}));
  }

  render() {
    const result = this.state.result;
    if (!result) {
      return (<div>Loading...</div>);
    }

    if (!result.states.length) {
      return (<div>Couldn&apos;t locate transaction {this.props.params.txhash}</div>);
    }
    const txStates = result.states;

    // TODO: linearId deletion might be temporary
    // I'm only removing it right now because it can contain a `null` which react-json-view can't handle (crashes)
    // We need to fix this here once https://www.npmjs.com/package/@seesemichaelj/react-json-view is fixed.
    const cleanData = this.getCleanStates(txStates);

    // TODO: can there be more there more than one state per hash and index!?
    const tx = txStates[0];
    const txData = cleanData[0];
    const participants = tx.state.data.participants || [];
    const meta = result.statesMetadata[0];
    const workspaceNotary = this.getWorkspaceNotary(tx.state.notary.owningKey);
    return (
      <div className="Nodes DataRows">
        <main>
          <div>
            <button className="Button" onClick={hashHistory.goBack}>
              &larr; Back
            </button>
            <div>
              TX {tx.ref.txhash}
            </div>
            <div>
              {meta.status}
            </div>
          </div>
          <div>
            <div>Contract</div>
            <div>{tx.state.contract}</div>
          </div>
          <div>{meta.status} State</div>
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
            enableClipboard={false}
            displayDataTypes={true}
            displayObjectSize={true}
            indentWidth={4}// indent by 4 because that's what Corda likes to do.
            collapsed={1}
            collapseStringsAfterLength={20}
          />
          <br/>
          {tx.state.data.exitKeys && tx.state.data.exitKeys.length ? (
            <>
              <div>Signers</div>
              {tx.state.data.exitKeys.map(key => {
                const workspaceNode = this.getWorkspaceNode(key);
                if (workspaceNode) {
                  return (<NodeLink key={"participant_" + workspaceNode.safeName} node={workspaceNode} />);
                } else {
                  return ("");
                }
              })}
              <br/>
            </>
          ) : ("")}
          <div>
            <div>Notary</div>
            <div>{<NodeLink node={workspaceNotary} />}</div>
          </div>
          <br/>
          <div>
            <div>Timestamp</div>
            <div>{meta.recordedTime}</div>
          </div>
          <br/>
          <div>
            <div>Participants</div>
            <div>
              {participants.map(node => {
                const workspaceNode = this.getWorkspaceNode(node.owningKey);
                if (workspaceNode) {
                  return (<NodeLink key={"participant_" + workspaceNode.safeName} node={workspaceNode} />);
                } else {
                  return ("");
                }
              })}
              </div>
          </div>
        </main>
      </div>
    );
  }
  getWorkspaceNode(owningKey) {
    return this.props.config.settings.workspace.nodes.find(node => owningKey === node.owningKey);
  }
  getWorkspaceNotary(owningKey) {
    return this.props.config.settings.workspace.notaries.find(notary => owningKey === notary.owningKey);
  }
}

export default connect(
  Transaction,
  "config"
);
