import React, { Component } from 'react'
import connect from '../helpers/connect'
import ProjectContracts from './ProjectContracts';

class ContractsScreen extends Component {

  render () {
    let content
    if (this.props.workspaces.current.projects.length > 0) {
      content = this.props.workspaces.current.projects.map((project, index) => {
        return (
          <div
            className="Project"
            key={"project-" + project.name}
          >
            <div className="ProjectName">
              <h2>{project.name}</h2>
              <span>{project.config.truffle_directory}</span>
            </div>
            <ProjectContracts
              contracts={project.contracts}
              contractCache={this.props.workspaces.current.contractCache}
              projectIndex={index}
            />
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