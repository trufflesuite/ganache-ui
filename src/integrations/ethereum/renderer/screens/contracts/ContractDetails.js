import { shell } from "electron";
const { app } = require("electron").remote;

import jsonTheme from "../../../../../common/utils/jsonTheme";
import ReactJson from "@ganache/react-json-view";
import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import TxList from "../transactions/TxList";
import FormattedEtherValue from "../../components/formatted-ether-value/FormattedEtherValue";
import ChecksumAddress from "../../components/checksum-addresses/ChecksumAddress";
import EventList from "../events/EventList";
import {
  getContractDetails,
  clearShownContract,
} from "../../../common/redux/workspaces/actions";
import OnlyIf from "../../../../../renderer/components/only-if/OnlyIf";
import { sanitizeError } from "../../../../../renderer/screens/helpers/sanitize";

class ContractDetails extends Component {
  constructor(props) {
    super(props);

    const project = this.props.workspaces.current.projects[
      this.props.match.params.projectIndex
    ];
    const filteredContracts = project.contracts.filter(
      c => c.address === this.props.match.params.contractAddress,
    );
    if (filteredContracts.length === 0) {
      // TODO: error
    }
    const contract = filteredContracts[0];

    this.state = { project, contract };
  
    const contractCache = this.props.workspaces.current.contractCache;
    const cache = contractCache[this.state.contract.address];
    const transactions = cache.transactions.slice(
      -Math.min(5, cache.transactions.length),
    );
    const events = cache.events.slice(-Math.min(5, cache.events.length));

    this.props.dispatch(
      getContractDetails({
        contract: this.state.contract,
        contracts: this.state.project.contracts,
        block: "latest",
        transactions,
        events,
      }),
    );
  }

  componentWillUnmount() {
    this.props.dispatch(clearShownContract());
  }

  renderIssueBody(sanitizedSystemError) {
    let issueBody =
      "<!-- Please give us as much detail as you can about what you were doing at the time of the error, and any other relevant information -->\n" +
      "\n" +
      "\n" +
      `PLATFORM: ${process.platform}\n` +
      `GANACHE VERSION: ${app.getVersion()}\n` +
      "\n" +
      "EXCEPTION:\n" +
      "```\n" +
      `${sanitizedSystemError}\n` +
      "```";

    return encodeURIComponent(issueBody).replace(/%09/g, "");
  }

  reportDecodingError() {
    const title = encodeURIComponent(
      `Decoding Error when running Ganache ${app.getVersion()} on ${
        process.platform
      }`,
    );

    const body = this.renderIssueBody(
      sanitizeError(this.props.workspaces.current.shownContract.state.error),
    );

    shell.openExternal(
      `https://github.com/trufflesuite/ganache-ui/issues/new?title=${title}&body=${body}`
    );
  }

  render() {
    const events = this.props.workspaces.current.shownContract.shownEvents.map(
      event => {
        return {
          name: event.decodedLog.name,
          contract: this.state.contract.contractName,
          transactionHash: event.transactionHash,
          logIndex: event.logIndex,
          timestamp: event.log.timestamp,
        };
      },
    );

    return (
      <div className="ContractDetailsScreen">
        <div className="TitleBar">
          <button className="BackButton" onClick={this.props.history.goBack}>
            &larr; Back
          </button>
          <h1 className="Title">{this.state.contract.contractName}</h1>
        </div>

        <div className="ContractDetailsBody">
          <div className="ContractInfoBody">
            <div className="data">
              <div className="dataItem">
                <div className="label">ADDRESS</div>
                <div className="value">
                  <ChecksumAddress address={this.state.contract.address} />
                </div>
              </div>
              <div className="dataItem">
                <div className="label">BALANCE</div>
                <div className="value">
                  <FormattedEtherValue
                    value={this.props.workspaces.current.shownContract.balance}
                  />
                </div>
              </div>
              <div className="dataItem">
                <div className="label">CREATION TX</div>
                <div className="value">
                  <ChecksumAddress
                    address={this.state.contract.creationTxHash}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="Title">
              <h2>STORAGE</h2>
            </div>
            <OnlyIf
              test={
                typeof this.props.workspaces.current.shownContract.state
                  .variables !== "undefined"
              }
            >
              <ReactJson
                src={
                  this.props.workspaces.current.shownContract.state.variables
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
                indentWidth={2}
                collapsed={1}
                collapseStringsAfterLength={20}
              />
            </OnlyIf>
            <OnlyIf
              test={
                typeof this.props.workspaces.current.shownContract.state
                  .error !== "undefined"
              }
            >
              <div className="DecodeError">
                There was an issue decoding your contract. Please file a GitHub
                Issue by clicking the button below.
                <div>
                  <button onClick={this.reportDecodingError.bind(this)}>
                    Raise Github Issue
                  </button>
                </div>
              </div>
            </OnlyIf>
          </div>

          <div>
            <div className="Title">
              <h2>TRANSACTIONS</h2>
            </div>
            <TxList
              loading={this.props.workspaces.current.shownContract.loading}
              transactions={
                this.props.workspaces.current.shownContract.shownTransactions
              }
              receipts={
                this.props.workspaces.current.shownContract.shownReceipts
              }
            />
          </div>

          <div>
            <div className="Title">
              <h2>EVENTS</h2>
            </div>
            <EventList
              loading={this.props.workspaces.current.shownContract.loading}
              eventList={events}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ContractDetails,
  "workspaces",
);
