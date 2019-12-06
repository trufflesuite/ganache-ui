import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";

import * as pkg from "../../../../package.json";

import OnlyIf from "../../../renderer/components/only-if/OnlyIf";
import {
  openWorkspace,
  openDefaultWorkspace,
  openNewWorkspaceConfig,
  deleteWorkspace,
  downloadExtras
} from "../../../common/redux/workspaces/actions";
import UpdateNotification from "../auto-update/UpdateNotification";
import ErrorModal from "../../components/modal/ErrorModal";
import UpdateModal from "../auto-update/UpdateModal";
import connect from "../helpers/connect";
import ModalDetails from "../../components/modal/ModalDetails";

import Spinner from "../../components/spinner/Spinner";

import Logo from "../../icons/logo.svg";
import ChainIcon from "../../icons/chain.svg";
import MenuIcon from "../../icons/list.svg";
import TrashIcon from "../../icons/trash-icon.svg";

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {flavor: "ethereum"};

    this.handleFlavorChange = this.handleFlavorChange.bind(this);
  }

  selectWorkspace(workspace) {
    this.props.dispatch(openWorkspace(workspace.name, workspace.flavor));
  }

  handleDeleteWorkspace(e) {
    const workspaceName = e.currentTarget.previousSibling.innerText;
    e.stopPropagation();
    e.preventDefault();

    document.activeElement.blur();

    const modalDetails = new ModalDetails(
      ModalDetails.types.WARNING,
      [
        {
          click: modal => {
            this.props.dispatch(deleteWorkspace(workspaceName));
            modal.close();
          },
          value: "Remove",
        },
        {
          value: "Cancel",
        },
      ],
      `Remove ${workspaceName} Workspace?`,
      `Removing the ${workspaceName} workspace will delete its associated blockchain data, including any deployments, transactions, and event history. Your project source code will not be deleted.`,
    );

    this.props.dispatch(ModalDetails.actions.setModalError(modalDetails));
  }

  handleQuickstartPress() {
    this.props.dispatch(openDefaultWorkspace(this.state.flavor));
  }

  handleDownloadPress() {
    this.props.dispatch(downloadExtras("corda"));
  }

  handleNewWorkspacePress() {
    this.props.dispatch(openNewWorkspaceConfig(this.state.flavor));
  }
  handleFlavorChange(event) {
    this.setState({flavor: event.target.value});
  }

  render() {
    let workspaces;
    const hasWorkspaces = this.props.workspaces.info.length;
    if (hasWorkspaces) {
      workspaces = this.props.workspaces.info.map(workspaceInfo => {
        return (
          <li key={workspaceInfo.name + workspaceInfo.flavor}>
            <button onClick={()=>this.selectWorkspace(workspaceInfo)}>
              <span>{workspaceInfo.name} ({workspaceInfo.flavor})</span>
              <div
                className="DeleteWorkspace"
                onClick={this.handleDeleteWorkspace.bind(this)}
              >
                <TrashIcon />
              </div>
            </button>
          </li>
        );
      });
      workspaces = <ul>{workspaces}</ul>;
    }

    const title = hasWorkspaces ? (
      <h1 className="title left">Workspaces</h1>
    ) : (
      <h1 className="title">Create a Workspace</h1>
    );
    const subTitle = (
      <p className="subTitle">
        Quickstart for a one-click blockchain or create a new workspace for
        advanced setup options.
      </p>
    );
    const learnMore = (
      <p className="learnMoreText">
        <a href="https://github.com/trufflesuite/ganache/releases/tag/v2.0.0">
          Learn more about the update to version 2!
        </a>
      </p>
    );
    const isNewVersionAvailable = this.props.autoUpdate.isNewVersionAvailable;
    const isCheckingForUpdate = this.props.autoUpdate.updateCheckInProgress;

    return (
      <React.Fragment>
        <div className="HomeScreenContainer">
          <div className="HomeScreen">
            <header>
              <div className="logo">
                <Logo />
                Ganache
                <span className="version"> v{pkg.version}</span>
              </div>
              <div className="updates">
                <OnlyIf test={isCheckingForUpdate && !isNewVersionAvailable}>
                  <Spinner />
                  Checking for Updates&hellip;
                </OnlyIf>
                <OnlyIf test={isNewVersionAvailable}>
                  <UpdateNotification />
                </OnlyIf>
              </div>
            </header>
            <div className="WorkspacesBody">
              <OnlyIf test={!hasWorkspaces}>
                <section>
                  {title}
                  {subTitle}
                </section>
              </OnlyIf>
              <OnlyIf test={hasWorkspaces}>
                <section>{title}</section>
                <section>
                  <div className="top">
                    <Scrollbars className="scrollBar">{workspaces}</Scrollbars>
                  </div>
                </section>
              </OnlyIf>
              <section>
                <div className="bottom">
                  <button onClick={this.handleQuickstartPress.bind(this)}>
                    <ChainIcon />
                    Quickstart
                  </button>
                  <select value={this.state.flavor} onChange={this.handleFlavorChange}>
                    <option value="ethereum">Ethereum</option>
                    <option value="corda">Corda</option>
                  </select>
                  <button onClick={this.handleDownloadPress.bind(this)}>
                    Download Corda
                  </button>
                  <button onClick={this.handleNewWorkspacePress.bind(this)}>
                    <MenuIcon />
                    New Workspace
                  </button>
                </div>
              </section>
            </div>
            <div className="LearnMore">{learnMore}</div>
          </div>
        </div>
        <OnlyIf test={this.props.core.modalError != null}>
          <ErrorModal modalError={this.props.core.modalError} />
        </OnlyIf>
        <OnlyIf
          test={!this.props.core.systemError && this.props.autoUpdate.showModal}
        >
          <UpdateModal />
        </OnlyIf>
      </React.Fragment>
    );
  }
}

export default connect(
  HomeScreen,
  "workspaces",
  "core",
  "autoUpdate",
);
