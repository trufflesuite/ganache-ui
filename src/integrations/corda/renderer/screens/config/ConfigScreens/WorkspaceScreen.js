import React, { Component } from "react";
import { remote } from "electron";
import ModalDetails from "../../../../../../renderer/components/modal/ModalDetails";
import SyntaxHighlighter from "react-syntax-highlighter";
import { readFileSync, existsSync } from "fs-extra";
import { join } from "path";
import { setToast } from "../../../../../../common/redux/network/actions";

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

  handleAddDirectoryClick = async () => {
    const pathArray = await remote.dialog.showOpenDialog({
      properties: ["openDirectory", "multiSelections"]
    });

    if (pathArray?.filePaths?.length > 0) {
      const notFound = pathArray.filePaths.filter((path) => {
        const buildGradle = join(path, "build.gradle");
        return !(existsSync(buildGradle) && readFileSync(buildGradle).toString().includes("corda"));
        // SEND TOAST
      });
      const len = notFound.length;
      if (len) {
        const y = len > 1 ? "ies" : "y";
        this.props.dispatch(setToast(`Unable to find a valid build.gradle in: ${notFound.join(",\n")}. Watching director${y} for cordApp jars.`));
      }
      this.props.addWorkspaceProject(pathArray.filePaths);
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
      "Removing an installed project may have unintended side effects.",
    );

    this.props.dispatch(ModalDetails.actions.setModalError(modalDetails));
  };

  handleRemoveProject = () => {
    const projectPath = this.props.config.settings.workspace.projects[
      this.state.selectedIdx
    ];

    if (this.projectIsSaved(this.state.selectedIdx)){
      this.verifyRemoveProject(projectPath);
    } else {
      this.removeProject(projectPath);
    }
  };

  projectIsSaved(selectedIdx){
    const projectPath = this.props.config.settings.workspace.projects[
      selectedIdx
    ];
    return this.props.workspaces.current.projects.some(project => projectPath === project)
  }

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
          <h4>Projects</h4>
          <div className="Row">
            <div className="RowItem">
              {validationErrors && (
                <div>
                  <div className="ValidationError">
                    {validationErrors.message || validationErrors.value || validationErrors}
                    { !validationErrors.stack ? "" : <>
                      <button onClick={this.toggleErrorDetails}>
                        {showErrorDetails
                          ? "hide stack trace"
                          : "show stack trace"}
                      </button>
                      { showErrorDetails && (
                        <div className="ValidationDetails">
                          <SyntaxHighlighter language="bash">
                            {Array.isArray(validationErrors.stack) ? validationErrors.stack.map(line => line.toString()) : (validationErrors.stack || "")}
                          </SyntaxHighlighter>
                        </div>
                      )}
                      </>
                    } 
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
                  onClick={this.handleAddDirectoryClick}
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
                Link CorDapps to this workspace by adding their
                jar files to this workspace.
              </p>
              <br />
              <p>
                {
                  "This will show useful transaction information to better understand what's going on under the hood."
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
