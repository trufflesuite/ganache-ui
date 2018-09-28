import React, { Component } from "react"
import { remote } from "electron"
import path from "path"

class WorkspaceScreen extends Component {
  state = { selectedIdx: null }

  validateChange = e => {
    this.props.validateChange(e, {})
  }

  handleProjectClick = idx => () => {
    this.setState({
      selectedIdx: this.state.selectedIdx === idx ? null : idx
    })
  }

  handleAddProjectClick = () => {
    const pathArray = remote.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Truffle Config File", extensions: ["js"] }
      ]
    })

    if (pathArray.length > 0 && path.basename(pathArray[0]).match(/^truffle(-config)?.js$/)) {
      this.props.addWorkspaceProject(pathArray[0])
      this.setState({ selectedIdx: null })
    }
  }

  handleRemoveProject = () => {
    const path = this.props.config.settings.workspace.projects[
      this.state.selectedIdx
    ]
    this.props.removeWorkspaceProject(path)
    this.setState({ selectedIdx: null })
  }

  render() {
    const { name, projects } = this.props.config.settings.workspace
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
                {projects.map((path, idx) => {
                  const selected = this.state.selectedIdx === idx
                  return (
                    <div
                      className={`projectItem ${selected && "active"}`}
                      key={path}
                      onClick={this.handleProjectClick(idx)}
                    >
                      {path}
                    </div>
                  )
                })}
              </div>
              <div className="WorkspaceButtons">
                <button
                  className="btn btn-primary"
                  onClick={this.handleAddProjectClick}
                >
                  ADD PROJECT
                </button>
                <button
                  className="btn btn-primary"
                  disabled={this.state.selectedIdx === null}
                  onClick={this.handleRemoveProject}
                >
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
