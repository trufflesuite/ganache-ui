import React, { Component } from "react";

import * as pkg from "../../../../package.json";

import connect from "../helpers/connect";

import Logo from "../../components/logo/Logo.js";
import OnlyIf from "../../components/only-if/OnlyIf";
import BugModal from "../appshell/BugModal";

class TitleScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      version: pkg.version,
      firstRun: undefined,
    };

    const intervalId = setInterval(() => {
      if (this.state.firstRun === true) {
        this.props.history.push("/first_run");
        clearInterval(intervalId);
      } else if (this.state.firstRun === false) {
        this.props.history.push("/home");
        clearInterval(intervalId);
      }
    }, 1000);
  }

  static getDerivedStateFromProps(nextProps) {
    if (
      "global" in nextProps.config.settings &&
      "firstRun" in nextProps.config.settings.global
    ) {
      return { firstRun: nextProps.config.settings.global.firstRun };
    } else return null;
  }

  render() {
    return (
      <div className="TitleScreenContainer">
        <div className="TitleScreen">
          <Logo fadeInElement={true} />
          <h4>
            <strong>Ganache</strong>
            <div className="GanacheVersion">v{this.state.version}</div>
          </h4>
        </div>
        <OnlyIf test={this.props.core.systemError != null}>
          <BugModal
            systemError={this.props.core.systemError}
            logs={this.props.logs}
          />
        </OnlyIf>
      </div>
    );
  }
}

export default connect(
  TitleScreen,
  "config",
  "core",
  "logs",
);
