import React, { Component } from "react";
import { Link } from "react-router";
import path from "path";
import connect from "../helpers/connect";
import ProjectContracts from "./ProjectContracts";
import OnlyIf from "../../components/only-if/OnlyIf";

class ContractsScreen extends Component {
  render() {
    let content;
    if (this.props.workspaces.current.projects.length > 0) {
      content = this.props.workspaces.current.projects.map((project, index) => {
        let errorMessage;
        if (typeof project.error !== "undefined") {
          switch (project.error) {
            case "project-does-not-exist": {
              errorMessage = (
                <span>
                  <strong>Your Truffle Project can no longer be found.</strong>{" "}
                  Did you delete or move it?{" "}
                  <Link className="settingsLink" to="/config">
                    Update the location
                  </Link>{" "}
                  or restart Ganache.
                </span>
              );
              break;
            }
            case "invalid-project-file": {
              errorMessage = (
                <span>
                  <strong>Your Truffle Project config is invalid.</strong> The
                  file should be named either 'truffle.js' or
                  'truffle-config.js'.{" "}
                  <Link className="settingsLink" to="/config">
                    Choose a valid configuration file.
                  </Link>
                </span>
              );
              break;
            }
            default: {
              errorMessage = (
                <span>
                  <strong>Unknown error:</strong> {project.error}
                </span>
              );
              break;
            }
          }
        }
        return (
          <div className="Project" key={"project-" + project.name}>
            <div className="ProjectName">
              <h2>{project.name}</h2>
              <span>
                {project.config
                  ? project.config.truffle_directory
                  : path.dirname(project.configFile)}
              </span>
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
                <span className="Warning">⚠</span> {errorMessage}
              </div>
            </OnlyIf>
          </div>
        );
      });
    } else {
      content = (
        <div className="NoProjects">
          <span className="title">No Projects in Workspace</span>
          <span className="description">
            Unlock more information about your smart contracts by linking a
            Truffle project.
            <br />
            View deployed contract addresses, associated transactions, decoded
            events, and even
            <br />
            contract state. Your contract data will update in real time during
            development.
          </span>
          <Link className="button" to="/config">
            <button>Link Truffle Projects</button>
          </Link>
        </div>
      );
    }

    return <div className="ContractsScreen">{content}</div>;
  }
}

export default connect(
  ContractsScreen,
  "workspaces",
);
