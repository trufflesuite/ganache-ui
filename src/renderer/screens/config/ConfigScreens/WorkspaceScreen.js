import React, { Component } from "react"

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

const TEMP_PROJECTS = [
  `C:\\truffle-projects\project1`,
  `C:\\truffle-projects\project2`,
  `C:\\truffle-projects\project3`,
  `C:\\truffle-projects\project4`,
  `C:\\truffle-projects\project5`
]

class WorkspaceScreen extends Component {
  state = { projects: this.props.config.settings.workspace.projects }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS)
  }

  render() {
    const { name, projects } = this.props.config.settings.workspace
    console.log("projects", projects)
    console.log(this.state.projects)
    return (
      <div>
        <h2>WORKSPACE</h2>
        <section>
          <h4>WORKSPACE NAME</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.name"
                type="text"
                value={name}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.default_balance_ether"] && (
                <p className="ValidationError">
                  Must be a valid number that is at least{" "}
                  {VALIDATIONS["server.default_balance_ether"].min}
                </p>
              )}
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
                {TEMP_PROJECTS.map(x => (
                  <div className="projectItem" key={x}>{x}</div>
                ))}
              </div>
              {this.props.validationErrors["server.default_balance_ether"] && (
                <p className="ValidationError">
                  Must be a valid number that is at least{" "}
                  {VALIDATIONS["server.default_balance_ether"].min}
                </p>
              )}
              <div className="WorkspaceButtons">
                <button className="btn btn-primary">ADD PROJECT</button>
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
