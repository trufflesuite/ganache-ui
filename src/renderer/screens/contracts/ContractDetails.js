// Contract Details to dos
// 0. Search for `TODO-DAVID:` in other files and see if you want to do those.
// 1. hook into the store
// 2. replace the mocked props with real data from @seese's AwesomeSauce he just cooked for us.
// 3. Have Josh look at the ReactJson styles and update them as he sees fit. I've commented the styles in the code below with what I've learned
//    a. I don't know of we can easily replace the JS types and formatting with Solidity types and custom formatting. Maybe though? I haven't checked. link: https://github.com/mac-s-g/react-json-view
//    b. you can disable types by setting `displayDataTypes={false}`
// 4. don't forget that RecentEvents isn't wired up yet to read from the passed prop, so even if you get that hooked up here, it won't render unless that's been fixed.
// 5. The Header below should be it's own module and used all over the place in the new UI.


import ReactJson from 'react-json-view'
import React, { Component } from 'react'
import connect from '../helpers/connect'
import TxList from '../transactions/TxList'
import FormattedEtherValue from '../../components/formatted-ether-value/FormattedEtherValue'
import ChecksumAddress from '../../components/checksum-addresses/ChecksumAddress'
import RecentEvents from "../events/RecentEvents"
import { hashHistory } from 'react-router'

class ContractDetails extends Component {
  render() {
    // TODO-DAVID: Mock props so I don't have hook into the store
    // you'll probably just pass in a `contract` a prop then read
    //    balances

    //  this.props.contract
    const contract = {
      name: "ComplexToken",
      address: "0x5c",
      creationTx: "0xc5"
    }
    // `balances` as an object is just copy pasted from somewhere else, it probably doesn't needs to be a property of the this.props.contract
    const balances = {
      [contract.address]: 123
    };

    // this.props.contract.transactions ? all of them? if not all, how many? if not all, how do we get to all of them?
    const transactions = [
      {
        to: "0x10",
        from: "0x1234",
        hash: "0x4321",
        value: 123
      },
      {
        to: "0x20",
        from: "0x1234",
        hash: "0x5432",
        value: 234
      },
      {
        to: "0x30",
        from: "0x4234",
        hash: "0x6432",
        value: 734
      },
      {
        to: "0x31",
        from: "0x5234",
        hash: "0x7432",
        value: 834
      },
      {
        to: "0x22",
        from: "0x1237",
        hash: "0x5436",
        value: 234
      },
      {
        to: "0x33",
        from: "0x4235",
        hash: "0x6433",
        value: 734
      },
      {
        to: "0x34",
        from: "0x5232",
        hash: "0x7431",
        value: 834
      }
    ];
    // you'll have to marry transactions and props
    const receipts = {};

    // TODO-DAVID: THIS IS JUST SOME MOCK AUTOMATION. THROW ME AWAY
    // create some receipts from the transactions above
    transactions.forEach((tx, i)=>{
       // mixing in some contract creations
      const contractAddress = i % 3 ? "0x123" : null;
      receipts[tx.hash] = {
        gasUsed: "123",
        contractAddress,

         // this is very fizzbuzz of me, isn't it. note: adding `input` doesn't currently trigger the "CONTRACT CALL" label because it's currently broken
        input: i % 2 ? "0x123" : null
      }
    });

    // this.props.contract.events
    // events isn't actually used yet. see RecentEvents.js for actual implmementation
    // once events are implemented there.
    const events = [
      {
        name: "ComplexTokenSent",
        contract: "ComplexToken",
        txHash: "0x_PLACEHOLDER_TX_HASH",
        blockTime: "2018-08-13 20:33:35"
      }
    ]

    // this.props.contract.storage
    const storage = {
      "Parent A": "Value",
      "Parent B": {
        "Child 1": "Grand Child",
        "Child 2": 123.45,
        "Child 3": [
          "mixed",
          "type",
          "array",
          123.45,
          true,
          null,
          undefined,
          {
            "foo":" bar"
          }
        ],
        "Child 4": true,
        "Child 5": false,
        "Child 5": undefined,
        "Child 5": null
      },
      "Parent C": [
        ["multi", "dim"],
        ["arrays", "yo"],
      ]
    }
    // end mocks!!!



    return (
      <section className="ContractDetailsScreen">
        {/* TODO-DAVID: this header needs to be a shared component with a props of "title" */}
        <header className="Header">
          <button className="Button" onClick={hashHistory.goBack}>
            &larr; Back
          </button>
          <div className="Title">
            <h1>
              { contract.name }
            </h1>
          </div>
        </header>

        <div className="ContractDetailsBody">
          <div className="ContractInfoBody">
            <div className="data">
              <div className="dataItem">
                <div className="label">ADDRESS</div>
                <div className="value">
                  <ChecksumAddress address={contract.address} />
                </div>
              </div>
              <div className="dataItem">
                <div className="label">BALANCE</div>
                <div className="value">
                  <FormattedEtherValue value={balances[contract.address].toString()} />
                </div>
              </div>
              <div className="dataItem">
                <div className="label">CREATION TX</div>
                <div className="value">
                  <ChecksumAddress address={contract.creationTx} />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="Title">
              <h2>TRANSACTIONS</h2>
            </div>
            <TxList transactions={transactions} receipts={receipts} />
          </div>

          <div>
            <div className="Title">
              <h2>STORAGE</h2>
            </div>
            <ReactJson
            src={storage} name={false} theme={{
                scheme: 'ganache',
                author: 'Ganache',
                //transparent main background
                base00: 'rgba(0, 0, 0, 0)',
                base01: 'rgb(245, 245, 245)',
                base02: '#000', // lines and background color for: NULL, undefined, and brackets
                base03: '#93a1a1', // blue grey -- not used?
                base04: 'rgba(0, 0, 0, 0.3)',
                base05: '#aaa', // undefined text
                base06: '#073642', // dark blue -- not sued?
                base07: '#000', // JSON keys
                base08: '#d33682', // pink -- not used?
                base09: '#F2AF67', // string types text (ganache orange)
                base0A: '#F2AF67', // NULL (ganache orange)
                base0B: '#3fe0c5', //aka --truffle-green, for  float types
                base0C: '#777', // array indexes and item counts
                base0D: '#000', // arrows
                base0E: '#000', // used for some arrows and bool
                base0F: '#268bd2' // a bright blue -- not used?
            }}
            iconStyle="triangle" edit={false} add={false} delete={false} enableClipboard={false} displayDataTypes={true} displayObjectSize={true} indentWidth={2} collapsed={1} collapseStringsAfterLength={20} />
          </div>

          <div>
            <div className="Title">
              <h2>EVENTS</h2>
            </div>
            {/* at the time of writing this comment, `events` isn't used in 
              RecentEvents yet, so you'll need to hook things up there first!
            */}
            <RecentEvents events={events} />
          </div>
        </div>
      </section>
    );
  }
};

export default ContractDetails
