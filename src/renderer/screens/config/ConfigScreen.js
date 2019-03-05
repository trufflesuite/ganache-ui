import React, { PureComponent } from "react";
import { hashHistory } from "react-router";
import cloneDeep from "lodash.clonedeep";
import isEqual from "lodash.isequal";
import connect from "../helpers/connect";

import * as Core from "../../../common/redux/core/actions";
import * as Config from "../../../common/redux/config/actions";
import {
  deleteWorkspace,
  closeWorkspace,
} from "../../../common/redux/workspaces/actions";

import WorkspaceScreen from "./ConfigScreens/WorkspaceScreen";
import ServerScreen from "./ConfigScreens/ServerScreen";
import AccountsScreen from "./ConfigScreens/AccountsScreen";
import ChainScreen from "./ConfigScreens/ChainScreen";
import AdvancedScreen from "./ConfigScreens/AdvancedScreen";
import AboutScreen from "./ConfigScreens/AboutScreen";

import RestartIcon from "../../icons/restart.svg";
import EjectIcon from "../../icons/eject.svg";
import SaveIcon from "../../icons/save-icon.svg";
import OnlyIf from "../../components/only-if/OnlyIf";

const TABS = [
  { name: "Workspace", subRoute: "workspace", component: WorkspaceScreen },
  { name: "Server", subRoute: "server", component: ServerScreen },
  {
    name: "Accounts & Keys",
    subRoute: "accounts-keys",
    component: AccountsScreen,
  },
  { name: "Chain", subRoute: "chain", component: ChainScreen },
  { name: "Advanced", subRoute: "advanced", component: AdvancedScreen },
  { name: "About", subRoute: "about", component: AboutScreen },
];

class ConfigScreen extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      config: cloneDeep(props.config),
      validationErrors: {},
      restartOnCancel: Object.keys(props.config.validationErrors).length > 0, // see handleCancelPressed
      activeIndex: 0,
    };

    this.initActiveIndex();
  }

  initActiveIndex = () => {
    if ("params" in this.props && "activeTab" in this.props.params) {
      for (let i = 0; i < TABS.length; i++) {
        if (TABS[i].subRoute === this.props.params.activeTab) {
          this.state.activeIndex = i;
          break;
        }
      }
    }
  };

  restartServer = () => {
    this.props.dispatch(Config.clearAllSettingErrors());
    this.state.config.validationErrors = {};

    if (this.isDirty()) {
      this.props.dispatch(
        Config.requestSaveSettings(
          this.state.config.settings.global,
          this.state.config.settings.workspace,
        ),
      );
    }
    this.props.dispatch(Core.requestServerRestart());
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
      if (this.props.config.startupMode !== Config.STARTUP_MODE.NORMAL) {
        this.props.dispatch(closeWorkspace());
        this.props.dispatch(
          deleteWorkspace(this.props.workspaces.current.name),
        );
      } else {
        hashHistory.goBack();
      }
    }
  };

  _renderTabHeader = () => {
    return TABS.map((tab, index) => {
      let className = `TabItem ${
        this.state.activeIndex == index ? "ActiveTab" : ""
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
    const alreadyExists = this.state.config.settings.workspace.projects.includes(
      path,
    );
    if (!alreadyExists) {
      this.state.config.settings.workspace.projects.push(path);
    }
    this.forceUpdate();
  };

  removeWorkspaceProject = path => {
    const newProjects = this.state.config.settings.workspace.projects.filter(
      x => x !== path,
    );
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
      TABS[this.state.activeIndex].component,
      {
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
                onClick={this.restartServer}
                disabled={this.invalidConfig()}
              >
                <OnlyIf
                  test={
                    this.props.config.startupMode !== Config.STARTUP_MODE.NORMAL
                  }
                >
                  <SaveIcon className="save-icon" /*size={18}*/ />
                  SAVE WORKSPACE
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
