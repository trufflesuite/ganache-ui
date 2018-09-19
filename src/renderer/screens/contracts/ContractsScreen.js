import React, { Component } from 'react'
import connect from '../helpers/connect'
import ProjectContracts from './ProjectContracts';

class ContractsScreen extends Component {
  render () {
    let content
    if (this.props.workspaces.current.projects.length > 0) {
      content = this.props.workspaces.current.projects.map((project) => {
        return (
          <div
            className="Project"
            key={"project-" + project.sanitizedName}
          >
            <div className="ProjectName">
              <div className="Label">{project.name}</div>
            </div>
            <ProjectContracts
              contracts={project.contracts}
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