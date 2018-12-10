import React, { Component } from 'react'
import { Link } from 'react-router'
import path from "path"
import connect from '../helpers/connect'
import ProjectContracts from './ProjectContracts';
import OnlyIf from "../../components/only-if/OnlyIf";

class ContractsScreen extends Component {

  render () {
    let content
    if (this.props.workspaces.current.projects.length > 0) {
      content = this.props.workspaces.current.projects.map((project, index) => {
        let errorMessage
        if (typeof project.error !== "undefined") {
          switch (project.error) {
            case "project-does-not-exist": {
              errorMessage = (
                <span><strong>Your Truffle Project can no longer be found.</strong> Did you delete or move it? Update the location in the <Link className="settingsLink" to="/config">settings screen</Link> or restart Ganache.</span>
              )
              break;
            }
            case "invalid-project-file": {
              errorMessage = (
                <span><strong>Your Truffle Project config is invalid.</strong> The file should either be 'truffle.js' or 'truffle-config.js'. Update the file in the <Link className="settingsLink" to="/config">settings screen</Link>.</span>
              )
              break;
            }
            default: {
              errorMessage = (
                <span><strong>Unknown error:</strong> {project.error}</span>
              )
              break;
            }
          }
        }
        return (
          <div
            className="Project"
            key={"project-" + project.name}
          >
            <div className="ProjectName">
              <h2>{project.name}</h2>
              <span>{project.config ? project.config.truffle_directory : path.dirname(project.configFile)}</span>
            </div>
            <OnlyIf test={typeof project.error === "undefined"}>
              <ProjectContracts
                contracts={project.contracts}
                contractCache={this.props.workspaces.current.contractCache}
                projectIndex={index}
              />
            </OnlyIf>
            <OnlyIf test={typeof project.error !== "undefined"}>
              <div className="Notice">
                <span className="Warning">⚠</span>{" "}
                {errorMessage}
              </div>
            </OnlyIf>
          </div>
        )
      })
    }
    else {
      content =
        <div className="Waiting">
          No Projects
        </div>
    }

    return (
      <div className="ContractsScreen">
        { content }
      </div>
    )
  }
}

export default connect(ContractsScreen, "workspaces")