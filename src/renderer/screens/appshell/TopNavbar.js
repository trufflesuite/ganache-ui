import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { push } from "connected-react-router";

import moniker from "moniker";

import connect from "../helpers/connect";
import * as Search from "../../../common/redux/search/actions";
import { setSystemError } from "../../../common/redux/core/actions";
import { setUpdateAvailable } from "../../../common/redux/auto-update/actions";
import {
  closeWorkspace,
  saveWorkspace,
} from "../../../common/redux/workspaces/actions";
import { clearLogLines } from "../../../common/redux/logs/actions";

import ModalDetails from "../../components/modal/ModalDetails";
import OnlyIf from "../../components/only-if/OnlyIf";
import StatusIndicator from "../../components/status-indicator/StatusIndicator";
import UpdateNotification from "../auto-update/UpdateNotification";

import AccountIcon from "../../icons/account.svg";
import BlockIcon from "../../icons/blocks.svg";
import TxIcon from "../../icons/transactions.svg";
import LogsIcon from "../../icons/console.svg";
import ContractsIcon from "../../icons/contract-icon.svg";
import EventsIcon from "../../icons/events-icon.svg";

import SettingsIcon from "../../icons/settings.svg";
import SearchIcon from "../../icons/search.svg";
import ForceMineIcon from "../../icons/force_mine.svg";
import SnapshotIcon from "../../icons/snapshot.svg";
import RevertIcon from "../../icons/revert.svg";

class TopNavbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchInput: "",
    };
  }

  _handleStopMining() {
    this.props.appStopMining();
  }

  _handleStartMining() {
    this.props.appStartMining();
  }

  _handleForceMine() {
    this.props.appForceMine();
  }

  _handleMakeSnapshot() {
    this.props.appMakeSnapshot();
  }

  _handleRevertSnapshot() {
    this.props.appRevertSnapshot(this.props.core.snapshots.length);
  }

  _handleClearLogs() {
    this.props.dispatch(clearLogLines(this.props.match.params.context || "default"));
  }

  handleSearchChange(e) {
    this.setState({
      searchInput: e.target.value,
    });
  }

  handleSearchKeyPress(e) {
    if (e.key === "Enter") {
      let value = this.state.searchInput.trim();

      // Secret to show the error screen when we need it.
      if (value.toLowerCase() == "error") {
        this.props.dispatch(
          setSystemError(new Error("You found a secret!"), true),
        );
      } else if (value.toLowerCase() == "test-update") {
        this.props.dispatch(
          setUpdateAvailable(
            "9.9.9",
            "Release Name",
            "This is a release note.\n\n**bold** _italic_ or is this *italic*? [trufflesuite/ganache-cli#417](https://github.com/trufflesuite/ganache-cli/issues/417)\n\nDo we scroll to get here?\n\nHow about here?",
          ),
        );
      } else if (value.toLowerCase() === "modal_error") {
        const modalDetails = new ModalDetails(
          ModalDetails.types.WARNING,
          [
            {
              click: modal => {
                alert("removing...");
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
      } else if (value.toLowerCase() === "loader") {
        this.props.dispatch(push("/loader"));
      } else {
        this.props.dispatch(Search.query(value));
      }

      this.setState({
        searchInput: "",
      });
    }
  }

  handleWorkspacesPress() {
    this.props.dispatch(closeWorkspace());
  }

  handleSaveWorkspacePress() {
    this.props.dispatch(saveWorkspace(moniker.choose()));
  }

  _renderSnapshotControls() {
    const { snapshots } = this.props.core;
    const currentSnapshotId = snapshots.length;
    const hasSnapshots = currentSnapshotId > 0;
    const firstSnapshot = currentSnapshotId === 1;

    return hasSnapshots ? (
      <button
        className="MiningBtn"
        onClick={this._handleRevertSnapshot}
        disabled={snapshots.length === 0}
      >
        <RevertIcon /*size={18}*/ />
        {firstSnapshot
          ? `REVERT TO BASE`
          : `REVERT TO SNAPSHOT #${currentSnapshotId - 1}`}
      </button>
    ) : null;
  }

  _renderMiningTime() {
    if (this.props.config.settings.workspace.server.blockTime) {
      return `${
        this.props.config.settings.workspace.server.blockTime
      } SEC block time`;
    } else {
      return "Automining";
    }
  }

  render() {
    const isLogsPage = this.props.location.pathname.startsWith("/logs");
    const isNewVersionAvailable = this.props.autoUpdate.isNewVersionAvailable;

    let children;
    const flavor = this.props.config.settings.workspace.flavor;
    switch (flavor) {
      case "ethereum":
          children = this._generateEthereumChildren();
          break;
      case "corda":
          children = this._generateCordaChildren();
        break;
    }

    return (
      <nav className="TopNavBar">
        <main className="Main">
          <div className="Menu">
            {children.menu}
            <NavLink to="/logs" activeClassName="Active">
              <LogsIcon />
              Logs
            </NavLink>
          </div>
          <div className="NotificationAndSearchBar">
            <OnlyIf test={isNewVersionAvailable}>
              <UpdateNotification />
            </OnlyIf>
            { flavor === "ethereum" ? <><input
              type="text"
              placeholder={children.searchText}
              title={children.searchText}
              value={this.state.searchInput}
              onChange={this.handleSearchChange.bind(this)}
              onKeyPress={this.handleSearchKeyPress.bind(this)}
            />
            <SearchIcon /></> : ""}
          </div>
        </main>
        <section className="StatusAndControls">
          <div className="Status">
            {children.status}
          </div>
          <div className="Actions">
            <StatusIndicator
              title="WORKSPACE"
              value={this.props.config.settings.workspace.name}
            />
            <OnlyIf test={this.props.config.settings.workspace.isDefault}>
              <button onClick={this.handleSaveWorkspacePress.bind(this)}>Save</button>
            </OnlyIf>
            <button onClick={this.handleWorkspacesPress.bind(this)}>Switch</button>
            <NavLink to="/config">
              <button>
                <div className="settingsIconWrapper">
                  <SettingsIcon />
                </div>
              </button>
            </NavLink>
            <OnlyIf test={isLogsPage}>
              <button onClick={this._handleClearLogs.bind(this)}>
                Clear Logs
              </button>
            </OnlyIf>
            {children.actions}
          </div>
        </section>
      </nav>
    );
  }
  _generateCordaChildren(){
    return {
      menu: (<>
        <NavLink to="/corda/nodes" activeClassName="Active">
          <BlockIcon />
          Nodes
        </NavLink>
        <NavLink to="/corda/transactions" activeClassName="Active">
          <TxIcon />
          Transactions
        </NavLink>
        <NavLink to="/corda/cordapps" activeClassName="Active">
          <ContractsIcon />
          CorDapps
        </NavLink>
      </>),
      searchText: "Search",
      status: (<>
        <StatusIndicator
            title="Total Nodes"
            value={this.props.config.settings.workspace.nodes.length}
        />
        <StatusIndicator
            title="Total Notaries"
            value={this.props.config.settings.workspace.notaries.length}
        />
        <StatusIndicator
            title="Total CorDapps"
            value={this.props.config.settings.workspace.projects.length}
        />
      </>),
      action: (<></>),
    }
  }

  _generateEthereumChildren(){
    const blockNumber = this.props.core.latestBlock;
    const gasPrice = this.props.core.gasPrice;
    const gasLimit = this.props.core.gasLimit;
    const hardfork = this.props.config.settings.workspace.server.hardfork;
    const snapshots = this.props.core.snapshots;
    const isMining = this.props.core.isMining;
    const miningPaused = !isMining;
    const currentSnapshotId = snapshots.length;
    const showControls = false;
    const contractsClassname = this.props.location.pathname.startsWith("/contracts") ? "Active" : "";

    return {
      menu: (
        <>
          <NavLink to="/accounts" activeClassName="Active">
            <AccountIcon />
            Accounts
          </NavLink>
          <NavLink to="/blocks" activeClassName="Active">
            <BlockIcon />
            Blocks
          </NavLink>
          <NavLink to="/transactions" activeClassName="Active">
            <TxIcon />
            Transactions
          </NavLink>
          <NavLink to="/contracts" className={contractsClassname} activeClassName="Active">
            <ContractsIcon />
            Contracts
          </NavLink>
          <NavLink to="/events" activeClassName="Active">
            <EventsIcon />
            Events
          </NavLink>
        </>
      ),
      searchText: "SEARCH FOR BLOCK NUMBERS OR TX HASHES",
      status: (
        <>
          <StatusIndicator title="CURRENT BLOCK" value={blockNumber} />
          { this.props.config.settings.workspace.server.fork ?
            (<StatusIndicator
              title="FORK BLOCK"
              tooltip={this.props.config.settings.workspace.server.fork}
              value={this.props.config.settings.workspace.server.fork_block_number}
            />) : ""
          }
          <StatusIndicator title="GAS PRICE" value={gasPrice} />
          <StatusIndicator title="GAS LIMIT" value={gasLimit} />
          <StatusIndicator title="HARDFORK" value={hardfork} />
          <StatusIndicator
            title="NETWORK ID"
            value={this.props.config.settings.workspace.server.network_id}
          />
          <StatusIndicator
            title="RPC SERVER"
            value={`http://${
              this.props.config.settings.workspace.server.hostname
            }:${this.props.config.settings.workspace.server.port}`}
          />
          <StatusIndicator
            title="MINING STATUS"
            value={miningPaused ? "STOPPED" : this._renderMiningTime()}
          />
        </>
      ),
      actions: (
        <>
          <OnlyIf test={showControls}>
            <button className="MiningBtn" onClick={this._handleForceMine}>
              <ForceMineIcon /*size={18}*/ /> Force Mine
            </button>
          </OnlyIf>
          <OnlyIf test={showControls}>
            <button className="MiningBtn" onClick={this._handleMakeSnapshot}>
              <SnapshotIcon /*size={18}*/ /> TAKE SNAPSHOT #
              {currentSnapshotId + 1}
            </button>
          </OnlyIf>
          <OnlyIf test={showControls}>
            {this._renderSnapshotControls()}
          </OnlyIf>
        </>
      )
    };
  }
}

export default connect(
  TopNavbar,
  "workspaces",
  "config"
);
