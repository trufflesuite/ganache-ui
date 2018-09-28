import React, { Component } from 'react'

import { Link } from 'react-router'

import OnlyIf from '../../components/only-if/OnlyIf'

export default class ContractCard extends Component {
  render () {
    return (
      <Link
        to={`/contracts/${this.props.projectIndex}/${this.props.address || "undeployed"}`}
        className="Link"
      >
        <div className="ContractCard">
          <div className="Row">
            <div className="RowItem">
              <div className="Name">
                <div className="Label">NAME</div>
                <div className="Value">
                  {this.props.name}
                </div>
              </div>
            </div>

            <div className="RowItem">
              <div className="Address">
                <div className="Label">ADDRESS</div>
                <div className="Value">
                  {this.props.address || "Not Deployed"}
                </div>
              </div>
            </div>

            <div className="RowItem">
              <div className="TxCount">
                <div className="Label">TX COUNT</div>
                <div className="Value">
                  {this.props.txCount}
                </div>
              </div>
            </div>

            <OnlyIf test={this.props.address !== ""}>
              <div className="RowItem">
                <div className="Badge">
                  <div className="Label">DEPLOYED</div>
                </div>
              </div>
            </OnlyIf>
          </div>
        </div>
      </Link>
    )
  }
}
