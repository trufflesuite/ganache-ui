import React, { PureComponent } from "react";
import cloneDeep from "lodash.clonedeep";
import isEqual from "lodash.isequal";
import connect from "../helpers/connect";

import * as Core from "../../../common/redux/core/actions";
import * as Config from "../../../common/redux/config/actions";
import {
  deleteWorkspace,
  closeWorkspace,
} from "../../../common/redux/workspaces/actions";

// common screens
import AboutScreen from "./ConfigScreens/AboutScreen";

// ethereum screens
import EthereumWorkspaceScreen from "../../../integrations/ethereum/renderer/screens/config/ConfigScreens/WorkspaceScreen";
import EthereumServerScreen from "../../../integrations/ethereum/renderer/screens/config/ConfigScreens/ServerScreen";
import EthereumAccountsScreen from "../../../integrations/ethereum/renderer/screens/config/ConfigScreens/AccountsScreen";
import ChainScreen from "../../../integrations/ethereum/renderer/screens/config/ConfigScreens/ChainScreen";
import AdvancedScreen from "../../../integrations/ethereum/renderer/screens/config/ConfigScreens/AdvancedScreen";

// filecoin screens
import FilecoinWorkspaceScreen from "../../../integrations/filecoin/renderer/screens/config/ConfigScreens/WorkspaceScreen";
import FilecoinServerScreen from "../../../integrations/filecoin/renderer/screens/config/ConfigScreens/ServerScreen";
import FilecoinAccountsScreen from "../../../integrations/filecoin/renderer/screens/config/ConfigScreens/AccountsScreen";
import FilecoinMinerScreen from "../../../integrations/filecoin/renderer/screens/config/ConfigScreens/MinerScreen";

import RestartIcon from "../../icons/restart.svg";
import EjectIcon from "../../icons/eject.svg";
import SaveIcon from "../../icons/save-icon.svg";
import StartIcon from "../../icons/start.svg";
import OnlyIf from "../../components/only-if/OnlyIf";

const ETHEREUM_TABS = [
  { name: "Workspace", subRoute: "workspace", component: EthereumWorkspaceScreen },
  { name: "Server", subRoute: "server", component: EthereumServerScreen },
  { name: "Accounts & Keys", subRoute: "accounts-keys", component: EthereumAccountsScreen },
  { name: "Chain", subRoute: "chain", component: ChainScreen },
  { name: "Advanced", subRoute: "advanced", component: AdvancedScreen }
];

const FILECOIN_TABS = [
  { name: "Workspace", subRoute: "workspace", component: FilecoinWorkspaceScreen },
  { name: "Server", subRoute: "server", component: FilecoinServerScreen },
  { name: "Accounts & Keys", subRoute: "accounts-keys", component: FilecoinAccountsScreen },
  { name: "Miner", subRoute: "miner", component: FilecoinMinerScreen },
];

const TABS = [
  { name: "About", subRoute: "about", component: AboutScreen }
];

class ConfigScreen extends PureComponent {
  constructor(props) {
    super(props);

    let tabs;
    switch (props.config.settings.workspace.flavor) {
      case "ethereum": {
        tabs = ETHEREUM_TABS;
        break;
      }
      case "filecoin": {
        tabs = FILECOIN_TABS;
        break;
      }
    }
    tabs = tabs.concat(TABS);

    this.state = {
      config: cloneDeep(props.config),
      validationErrors: {},
      restartOnCancel: Object.keys(props.config.validationErrors).length > 0, // see handleCancelPressed
      activeIndex: 0,
      TABS: tabs
    };

    this.initActiveIndex();
  }

  initActiveIndex = () => {
    if ("params" in this.props.match && "activeTab" in this.props.match.params) {
      const TABS = this.state.TABS
      for (let i = 0; i < TABS.length; i++) {
        // Get the tab name, no matter if the subroute has a flavor prefix.
        let subRoute = TABS[i].subRoute;
        let tabName = subRoute.substring(subRoute.indexOf("/") + 1);

        if (tabName === this.props.match.params.activeTab) {
          // eslint-disable-next-line react/no-direct-mutation-state
          this.state.activeIndex = i;
          break;
        }
      }
    }
  };

  saveWorkspace = () => {
    this.props.dispatch(Config.clearAllSettingErrors());
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.config.validationErrors = {};

    if (this.isDirty()) {
      this.props.dispatch(
        Config.requestSaveSettings(
          this.state.config.settings.global,
          this.state.config.settings.workspace
        ),
      );
    }

    if (this.props.config.startupMode !== Config.STARTUP_MODE.EDIT_WORKSPACE) {
      this.props.dispatch(Core.requestServerRestart());
    } else {
      this.props.dispatch(Core.showHomeScreen());
    }
  };

  isDirty() {
    return (
      isEqual(this.state.config.settings, this.props.config.settings) == false
    );
  }

  handleCancelPressed = () => {
    if (this.state.restartOnCancel) {
      // we are in the config screen because of a system error
      // restart application without saving settings if the user hit cancel
      this.props.dispatch(Core.requestServerRestart());
    } else {
      if (this.props.config.startupMode === Config.STARTUP_MODE.NEW_WORKSPACE) {
        this.props.dispatch(closeWorkspace());
        this.props.dispatch(
          deleteWorkspace(this.props.workspaces.current.name, this.props.workspaces.current.flavor),
        );
      } else {
        this.props.history.goBack();
      }
    }
  };

  _renderTabHeader = () => {
    return this.state.TABS.map((tab, index) => {
      let className = `TabItem ${this.state.activeIndex == index ? "ActiveTab" : ""
        }`;

      return (
        <div
          key={tab.name}
          className={className}
          onClick={this.handleMakeTabActive.bind(this, index)}
        >
          {tab.name}
        </div>
      );
    });
  };

  handleMakeTabActive = index => {
    this.setState({
      activeIndex: index,
    });
  };

  addWorkspaceProject = path => {
    const update = (_path) => {
      const alreadyExists = this.state.config.settings.workspace.projects.includes(_path);
      if (!alreadyExists) {
        this.state.config.settings.workspace.projects.push(_path);
      }
    }
    if (Array.isArray(path)) {
      path.forEach(update);
    } else {
      update(path);
    }
    this.forceUpdate();
  };

  isFilecoin = () => this.state.config.settings.workspace.flavor === "filecoin";

  removeWorkspaceProject = path => {
    const newProjects = this.state.config.settings.workspace.projects.filter(
      x => x !== path,
    );
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.config.settings.workspace.projects = newProjects;

    this.forceUpdate();
  };

  handleInputChange = event => {
    const target = event.target;
    const name = target.name;
    let value = target.value;

    // the user is modifying this field; if there is an error, send an action to clear it
    // the user has acknowledged the error by modifying the field
    if (target.name in this.state.config.validationErrors) {
      this.props.dispatch(Config.clearSettingError(target.name));
      delete this.state.config.validationErrors[target.name];
    }

    switch (target.type) {
      case "number":
        value = parseInt(target.value);
        break;
      case "checkbox":
        value = target.checked;
        break;
    }

    if (
      typeof target.attributes !== "undefined" &&
      target.attributes["data-type"]
    ) {
      switch (target.attributes["data-type"].value) {
        case "number": {
          value = parseFloat(target.value);
          break;
        }
        case "boolean": {
          value = target.value === "true";
          break;
        }
      }
    }

    var keys = name.split(".");
    var parent = this.state.config.settings;

    while (keys.length > 1) {
      var key = keys.shift();
      parent = parent[key];
    }

    if (keys.length != 1) {
      throw new Error("Unknown input name or key state; " + name);
    }

    // There should be one key remaining
    // Only save the value if the text box or input value is non-zero/non-blank.
    // Otherwise remove the key.
    if (value !== null && value !== undefined) {
      parent[keys[0]] = value;
    } else {
      // We used to delete the key here, but if we do that then the settings
      // migration logic in the bootstrap method of the Settings service won't
      // be able to tell that we're aware of this setting already, causing it
      // to apply the initial default value the next time the application
      // starts. Setting it to null gives the merge logic something to override
      // the initial default with. This is fine, so long as we preserve the
      // semantics of "null" meaning "purposefully left unset". Further, we
      // strip out nulls in Settings.getAll just to be certain that nothing can
      // surprise us by interpreting a key with a null value differently from a
      // missing key.
      parent[keys[0]] = null;
    }

    this.forceUpdate();
  };

  onNotifyValidationError = name => {
    var validationErrors = this.state.validationErrors;

    validationErrors[name] = true;

    this.setState({
      validationErrors: validationErrors,
    });
  };

  onNotifyValidationsPassed = name => {
    var validationErrors = this.state.validationErrors;

    validationErrors[name] = false;

    this.setState({
      validationErrors: validationErrors,
    });
  };

  validateChange = (e, validations) => {
    var name = e.target.name;
    var value = e.target.value;

    const validation = validations[name];

    if (validation) {
      let isValid = true;

      if (value != null) {
        if (!validation.canBeBlank && value === "") {
          isValid = false;
        }

        if (validation.allowedChars && !value.match(validation.allowedChars)) {
          isValid = false;
        }

        if (validation.format && !value.match(validation.format)) {
          isValid = false;
        }

        // If we at least have a value, check to see if it has a min/max
        if (value != "") {
          value = parseFloat(value, 10);

          if (validation.min && (value < validation.min || isNaN(value))) {
            isValid = false;
          }

          if (validation.max && value > validation.max) {
            isValid = false;
          }
        }
      }

      if (isValid) {
        this.onNotifyValidationsPassed(e.target.name);
      } else {
        this.onNotifyValidationError(e.target.name);
      }
    }

    this.handleInputChange(e);
  };

  invalidConfig = () => {
    let hasValidationErrors = false;
    for (let key of Object.keys(this.state.validationErrors)) {
      hasValidationErrors =
        hasValidationErrors || this.state.validationErrors[key];
    }
    return hasValidationErrors;
  };

  render() {
    let activeTab = React.createElement(
      this.state.TABS[this.state.activeIndex].component,
      {
        data: this.state.TABS[this.state.activeIndex].data || null,
        config: this.state.config,
        network: this.props.network,
        handleInputChange: this.handleInputChange,
        validateChange: this.validateChange,
        validationErrors: this.state.validationErrors,
        addWorkspaceProject: this.addWorkspaceProject,
        removeWorkspaceProject: this.removeWorkspaceProject,
        workspaces: this.props.workspaces,
        dispatch: this.props.dispatch,
      },
    );

    return (
      <main className="ConfigScreen">
        <div className="Tabs">
          <div className="Header">
            <div className="TabItems">{this._renderTabHeader()}</div>
            <div className="Actions">
              <button
                className="btn btn-primary"
                onClick={this.handleCancelPressed}
              >
                <EjectIcon /*size={18}*/ />
                CANCEL
              </button>
              <button
                className="btn btn-primary"
                onClick={this.saveWorkspace}
                disabled={this.invalidConfig()}
              >
                <OnlyIf
                  test={
                    this.props.config.startupMode === Config.STARTUP_MODE.EDIT_WORKSPACE
                  }
                >
                  <SaveIcon className="save-icon" /*size={18}*/ />
                  SAVE WORKSPACE
                </OnlyIf>
                <OnlyIf
                  test={
                    this.props.config.startupMode === Config.STARTUP_MODE.NEW_WORKSPACE
                  }
                >
                  <StartIcon className="start-icon" /*size={18}*/ />
                  START
                </OnlyIf>
                <OnlyIf
                  test={
                    this.props.config.startupMode === Config.STARTUP_MODE.NORMAL
                  }
                >
                  <RestartIcon /*size={18}*/ />
                  {this.isDirty() ? "SAVE AND RESTART" : "RESTART"}
                </OnlyIf>
              </button>
            </div>
          </div>
          <div className="ConfigCard">
            <OnlyIf test={this.props.config.settings.workspace.isDefault}>
              <div className="Notice">
                <span className="Warning">⚠</span>{" "}
                <strong>
                  Restarting the Quickstart workspace resets the blockchain.
                </strong>{" "}
                All transactions and contract states will be reset.
              </div>
            </OnlyIf>
            {activeTab}
          </div>
        </div>
      </main>
    );
  }
}

export default connect(
  ConfigScreen,
  "config",
  "network",
  "workspaces",
);
