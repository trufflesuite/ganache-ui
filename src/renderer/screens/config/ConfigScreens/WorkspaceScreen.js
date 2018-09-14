import React, { Component } from 'react'

const VALIDATIONS = {
  "server.total_accounts": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 100
  },
  "server.default_balance_ether": {
    allowedChars: /^[0-9]*\.?[0-9]*$/,
    min: 0
  }
}

class WorkspaceScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      accountsLocked: !!props.config.settings.workspace.server.unlocked_accounts,
      automnemonic: props.config.settings.workspace.randomizeMnemonicOnStart
    }
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS)
  }

  render () {
    return (
      <div>
        <h2>WORKSPACE</h2>
        <section>
          <h4>WORKSPACE NAME</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.server.default_balance_ether"
                type="text"
                value={this.props.config.settings.workspace.server.default_balance_ether}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.default_balance_ether"] &&
                <p className="ValidationError">Must be a valid number that is at least {VALIDATIONS["server.default_balance_ether"].min}</p>}
            </div>
            <div className="RowItem">
              <p>A friendly name for this workspace.</p>
            </div>
          </div>
        </section>
        <section>
          <h4>TRUFFLE PROJECTS</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="WorkspaceProjects">
                <div className="projectItem active">C:\truffle-projects\project1</div>
                <div className="projectItem">C:\truffle-projects\project2</div>
                <div className="projectItem">C:\truffle-projects\project3</div>
                <div className="projectItem">C:\truffle-projects\project4</div>
                <div className="projectItem">C:\truffle-projects\project5</div>
              </div>
              {this.props.validationErrors["server.default_balance_ether"] &&
                <p className="ValidationError">Must be a valid number that is at least {VALIDATIONS["server.default_balance_ether"].min}</p>}
              <div className="WorkspaceButtons">
                <button className="btn btn-primary">
                  ADD PROJECT
                </button>
                <button className="btn btn-primary" disabled>
                  REMOVE PROJECT
                </button>
              </div>
            </div>
            <div className="RowItem">
              <p>The Truffle projects linked with this workspace.</p>
              <p>Linked projects will show decoded contract and event data.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default WorkspaceScreen
