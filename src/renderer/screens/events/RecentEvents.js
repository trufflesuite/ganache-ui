import React, { Component } from "react"

import connect from "../helpers/connect"

// import * as Events from '../../../common/redux/events/actions'

import EventList from "./EventList"

const events = [
  {
    name: "ComplexTokenSent",
    contract: "ComplexToken",
    txHash: "0x_PLACEHOLDER_TX_HASH",
    blockTime: "2018-08-13 20:33:35"
  },
  {
    name: "ComplexTokenSent",
    contract: "ComplexToken",
    txHash: "0x_PLACEHOLDER_TX_HASH",
    blockTime: "2018-08-13 20:33:35"
  },
  {
    name: "ENCODED EVENT",
    contract: "0x_PLACEHOLDER_CONTRACT_ADDR",
    txHash: "0x_PLACEHOLDER_TX_HASH",
    blockTime: "2018-08-13 20:33:35"
  }
]

class RecentEvents extends Component {
  // componentWillReceiveProps(nextProps) {
  //   // If the scroll position changed...
  //   if (nextProps.appshell.scrollPosition != this.props.appshell.scrollPosition) {
  //     if (nextProps.appshell.scrollPosition == "top") {
  //       this.props.dispatch(Transactions.requestPreviousPage())
  //     } else if (nextProps.appshell.scrollPosition == "bottom") {
  //       this.props.dispatch(Transactions.requestNextPage())
  //     }
  //     return
  //   }

  //   // No change in scroll position?
  //   var blocksRequested = Object.keys(nextProps.transactions.blocksRequested)
  //   var latestBlockRequested = Math.max.apply(Math, blocksRequested.concat(-1))
  //   if (nextProps.appshell.scrollPosition == "top" && nextProps.core.latestBlock > latestBlockRequested) {
  //     this.props.dispatch(Transactions.requestPreviousPage())
  //   }
  // }

  render() {
    return (
      <div className="RecentEvents">
        <EventList events={[]} />
      </div>
    )
  }
}

export default connect(
  RecentEvents,
  "core",
  "appshell"
)
