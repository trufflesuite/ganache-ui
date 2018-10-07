import React, { Component } from 'react'

import connect from '../helpers/connect'

import MiniTxCard from './MiniTxCard'

class TxList extends Component {
  render () {
    var content
    if (this.props.transactions.length > 0) {
      content = this.props.transactions.map((tx) => {
        let contractName = null
        if (tx.to) {
          for (let i = 0; i < this.props.workspaces.current.projects.length; i++) {
            const project = this.props.workspaces.current.projects[i]
            for (let j = 0; j < project.contracts.length; j++) {
              const contract = project.contracts[j]
              if (contract.address && contract.address.toLowerCase() === tx.to.toLowerCase()) {
                console.log(contract.contractName)
                contractName = contract.contractName
              }
            }
          }
        }
        return <MiniTxCard
          tx={tx}
          contractName={contractName}
          receipt={this.props.receipts[tx.hash]}
          key={`tx-${tx.hash}`}
        />
      })
    } else {
      content = 
        <div className="Waiting">
          No transactions
        </div>
    }

    return (
      <div className="TxList">
        { content }
      </div>
    )
  }
}

export default connect(TxList, "workspaces")