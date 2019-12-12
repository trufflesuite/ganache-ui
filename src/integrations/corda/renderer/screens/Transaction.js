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

  refresh() {
    const node = this.props.config.settings.workspace.nodes.find(node => node.safeName === this.props.params.node);
    if (!node) {
      this.setState({results: []});
      return;
    }
    const requests = ["UNCONSUMED", "CONSUMED"].map((status) => {
      return fetch("https://localhost:" + (node.rpcPort + 10000) + "/api/rest/vault/vaultQueryBy", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          "criteria" : {
            "@class" : ".QueryCriteria$VaultQueryCriteria",
            "status" : status,
            // "contractStateTypes" : null,
            "stateRefs" : [{txhash: this.props.params.txhash}],
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
            // "participants" : null
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
      .then(res => res.json());
    });
    return Promise.all(requests).then(results => {
      this.setState({results})
    });
  }
  constructor(props) {
    super(props);

    this.state = {results:[]};
  }

  render() {
    const results = this.state.results;
    if (results.length === 0) {
      return (<div>Loading...</div>);
    } else if (!results[0].states || results[0].states.length === 0) {
      return (<div>Couldn&apos;t locate transaction {this.props.params.txhash}</div>);
    }
    const tx = results[0].states[0];
    const consumedTx = results.length > 1 && results[1].states.length !== 0 ? results[1].states[0] : null;
    const meta = results[0].statesMetadata[0];

    // TODO: linearId deletion might be temporary
    // I'm only removing it right now because it can contain a `null` which react-json-view can't handle (crashes)
    // We need to fix this here once https://www.npmjs.com/package/@seesemichaelj/react-json-view is fixed.
    const participants = tx.state.data.participants || [];
    const ignoreFields = ["@class", "participants", "linearId"];
    const unconsumedState = Object.keys(tx.state.data).reduce((acc, key) => {
      if(!ignoreFields.includes(key)){
        acc[key] = tx.state.data[key];
      }
      return acc;
    }, {});
    const workspaceNotary = this.getWorkspaceNotary(tx.state.notary.name);
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
          <div>Unconsumed</div>
          <ReactJson
            src={
              unconsumedState
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
          <div>Consumed</div>
          <ReactJson
            src={
              consumedTx ? consumedTx.state.data : {}
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
          <div>
            <div>Signers</div>
            <div>...</div>
          </div>
          <div>
            <div>Notary</div>
            <div>{<NodeLink node={workspaceNotary} />}</div>
          </div>
          <div>
            <div>Timestamp</div>
            <div>{meta.recordedTime}</div>
          </div>
          <div>
            <div>Participants</div>
            <div>
              {participants.map(node => {
                const workspaceNode = this.getWorkspaceNode(node.name);
                return (<NodeLink key={"participant_" + workspaceNode.safeName} node={workspaceNode} />);
              })}
              </div>
          </div>
        </main>
      </div>
    );
  }
  getWorkspaceNode(legalName) {
    return this.props.config.settings.workspace.nodes.find(node => legalName.replace(/\s/g, "") === node.name.replace(/\s/g,""));
  }
  getWorkspaceNotary(legalName) {
    return this.props.config.settings.workspace.notaries.find(notary => legalName.replace(/\s/g, "") === notary.name.replace(/\s/g,""));
  }
}

export default connect(
  Transaction,
  "config"
);
