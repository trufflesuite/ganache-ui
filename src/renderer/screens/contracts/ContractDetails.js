import ReactJson from '@seesemichaelj/react-json-view'
import React, { Component } from 'react'
import connect from '../helpers/connect'
import TxList from '../transactions/TxList'
import FormattedEtherValue from '../../components/formatted-ether-value/FormattedEtherValue'
import ChecksumAddress from '../../components/checksum-addresses/ChecksumAddress'
import EventList from "../events/EventList"
import { hashHistory } from 'react-router'
import { getContractDetails, clearShownContract } from "../../../common/redux/workspaces/actions"

class ContractDetails extends Component {
  constructor(props) {
    super(props)

    const project = this.props.workspaces.current.projects[this.props.params.projectIndex]
    const filteredContracts = project.contracts.filter((c) => c.address === this.props.params.contractAddress)
    if (filteredContracts.length === 0) {
      // TODO: error
    }
    const contract = filteredContracts[0]

    this.state = { project, contract }
  }

  componentWillMount () {
    const transactions = this.state.contract.transactions.slice(-Math.min(5, this.state.contract.transactions.length))
    const events = this.state.contract.events.slice(-Math.min(5, this.state.contract.events.length))

    this.props.dispatch(getContractDetails({
      contract: this.state.contract,
      contracts: this.state.project.contracts,
      block: "latest",
      transactions,
      events
    }))
  }

  componentWillUnmount () {
    this.props.dispatch(clearShownContract())
  }

  render() {
    const events = this.props.workspaces.current.shownContract.shownEvents.map((event) => {
      return {
        name: event.decodedLog.name,
        contract: this.state.contract.contractName,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
        timestamp: event.log.timestamp
      }
    })

    return (
      <div className="ContractDetailsScreen">
        <div className="TitleBar">
          <button className="BackButton" onClick={hashHistory.goBack}>
            &larr; Back
          </button>
          <h1 className="Title">
            { this.state.contract.contractName }
          </h1>
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
                  <FormattedEtherValue value={this.props.workspaces.current.shownContract.balance} />
                </div>
              </div>
              <div className="dataItem">
                <div className="label">CREATION TX</div>
                <div className="value">
                  <ChecksumAddress address={this.state.contract.creationTxHash} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="Title">
              <h2>STORAGE</h2>
            </div>
            <ReactJson
              src={this.props.workspaces.current.shownContract.state} name={false} theme={{
                  scheme: 'ganache',
                  author: 'Ganache',
                  //transparent main background
                  base00: 'rgba(0, 0, 0, 0)',
                  base01: 'rgb(245, 245, 245)',
                  base02: '#000', // lines and background color for: NULL, undefined, and brackets
                  base03: 'rgb(26, 185, 70)', // blue grey -- not used?
                  base04: 'rgba(0, 0, 0, 0.3)',
                  base05: '#aaa', // undefined text
                  base06: '#073642', // dark blue -- not sued?
                  base07: '#000', // JSON keys
                  base08: '#d33682', // pink -- not used?
                  base09: 'rgb(208, 108, 0)', // string types text (ganache orange)
                  base0A: 'rgb(208, 108, 0)', // NULL (ganache orange)
                  base0B: '#3fe0c5', //aka --truffle-green, for  float types
                  base0C: '#777', // array indexes and item counts
                  base0D: '#000', // arrows
                  base0E: '#000', // used for some arrows and bool
                  base0F: '#268bd2', // a bright blue -- not used?
                  base10: 'rgb(26, 185, 70)' // a bright blue -- not used?
              }}
              iconStyle="triangle"
              edit={false}
              add={false}
              delete={false}
              enableClipboard={false}
              displayDataTypes={true}
              displayObjectSize={true}
              indentWidth={2}
              collapsed={1}
              collapseStringsAfterLength={20}
            />
          </div>
          
          <div>
            <div className="Title">
              <h2>TRANSACTIONS</h2>
            </div>
            <TxList transactions={this.props.workspaces.current.shownContract.shownTransactions} receipts={this.props.workspaces.current.shownContract.shownReceipts} />
          </div>

          <div>
            <div className="Title">
              <h2>EVENTS</h2>
            </div>
            <EventList eventList={events} />
          </div>
        </div>
      </div>
    );
  }
};

export default connect(ContractDetails, "workspaces")
