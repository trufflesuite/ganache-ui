import React, { Component } from "react";

import connect from "../helpers/connect";

import ContractCard from "./ContractCard";

class ProjectContracts extends Component {
  render() {
    let content;
    if (this.props.contracts.length > 0) {
      content = this.props.contracts.map(contract => {
        const cache = this.props.contractCache[contract.address];
        return (
          <ContractCard
            name={contract.contractName}
            address={contract.address || ""}
            txCount={
              cache && cache.transactions ? cache.transactions.length : 0
            }
            projectIndex={this.props.projectIndex}
            key={"contract-" + contract.contractName}
          />
        );
      });
    } else {
      content = (
        <div className="Notice">
          <span className="Warning">⚠</span>{" "}
          <strong>To see rich contract data</strong> compile the contracts
          within your Truffle Project.
        </div>
      );
    }

    return <div className="ProjectContracts">{content}</div>;
  }
}

export default connect(ProjectContracts);
