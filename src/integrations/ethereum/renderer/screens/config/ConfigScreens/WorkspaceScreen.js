import React, { Component } from "react";
const remote = require("@electron/remote");
import path from "path";
import ModalDetails from "../../../../../../renderer/components/modal/ModalDetails";
import SyntaxHighlighter from "react-syntax-highlighter";

class WorkspaceScreen extends Component {
  state = { selectedIdx: null };

  validateChange = e => {
    this.props.validateChange(e, {});
  };

  handleProjectClick = idx => () => {
    this.setState({
      selectedIdx: this.state.selectedIdx === idx ? null : idx,
    });
  };

  handleAddProjectClick = async () => {
    const pathArray = await remote.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Truffle Config File", extensions: ["js"] }],
    });

    if (
      pathArray &&
      pathArray.filePaths.length > 0 &&
      path.basename(pathArray.filePaths[0]).match(/^truffle(-config)?.js$/)
    ) {
      this.props.addWorkspaceProject(pathArray.filePaths[0]);
      this.setState({ selectedIdx: null });
    }
  };

  removeProject = projectPath => {
    this.props.removeWorkspaceProject(projectPath);
    this.setState({ selectedIdx: null });
  };

  verifyRemoveProject = projectPath => {
    const modalDetails = new ModalDetails(
      ModalDetails.types.WARNING,
      [
        {
          click: modal => {
            this.removeProject(projectPath);
            modal.close();
          },
          value: "Remove",
        },
        {
          value: "Cancel",
        },
      ],
      "Remove Project?",
      "This project has contracts deployed; are you sure you want to remove it? Contract data, transactions, and events will no longer be decoded.",
    );

    this.props.dispatch(ModalDetails.actions.setModalError(modalDetails));
  };

  handleRemoveProject = () => {
    const projectPath = this.props.config.settings.workspace.projects[
      this.state.selectedIdx
    ];

    let projectHasDeployedContracts = false;

    let project = this.props.workspaces.current.projects.filter(project => {
      return path.dirname(projectPath) === project.configFile;
    });

    if (project.length > 0) {
      project = project[0];

      if (typeof project.error === "undefined") {
        projectHasDeployedContracts = project.contracts.reduce(
          (accumulator, contract) => {
            return (
              accumulator ||
              (typeof contract.address === "string" &&
                contract.address.length > 0)
            );
          },
          false,
        );
      }
    }

    if (projectHasDeployedContracts) {
      this.verifyRemoveProject(projectPath);
    } else {
      this.removeProject(projectPath);
    }
  };

  toggleErrorDetails = () =>
    this.setState({ showErrorDetails: !this.state.showErrorDetails });

  render() {
    const { name, projects } = this.props.config.settings.workspace;
    const validationErrors = this.props.config.validationErrors[
      "workspace.project"
    ];
    const showErrorDetails = this.state.showErrorDetails;
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
                disabled={this.props.config.settings.workspace.isDefault}
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
              {validationErrors && (
                <div>
                  <div className="ValidationError">
                    {validationErrors.message}
                    <button onClick={this.toggleErrorDetails}>
                      {showErrorDetails
                        ? "hide stack trace"
                        : "show stack trace"}
                    </button>
                    {showErrorDetails && (
                      <div className="ValidationDetails">
                        <SyntaxHighlighter language="bash">
                          {validationErrors.stack.map(line => line.toString())}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                  <br />
                </div>
              )}
              <div className="WorkspaceProjects">
                <div className="projectItemContainer">
                  {(projects || []).map((path, idx) => {
                    const selected = this.state.selectedIdx === idx;
                    return (
                      <div
                        className={`projectItem ${selected && "active"}`}
                        key={path}
                        onClick={this.handleProjectClick(idx)}
                      >
                        {path}
                      </div>
                    );
                  })}
                </div>
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
              <p>
                Link Truffle projects to this workspace by adding their
                truffle-config.js or truffle.js file to this workspace.
              </p>
              <br />
              <p>
                {
                  "This will show useful contract and event data to better understand what's going on under the hood."
                }
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default WorkspaceScreen;
