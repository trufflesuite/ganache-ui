import React, { Component } from "react";
import { hashHistory } from "react-router";

import * as pkg from "../../../../package.json";

import connect from "../helpers/connect";

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
        hashHistory.push("/first_run");
        clearInterval(intervalId);
      } else if (this.state.firstRun === false) {
        hashHistory.push("/home");
        clearInterval(intervalId);
      }
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (
      "global" in nextProps.config.settings &&
      "firstRun" in nextProps.config.settings.global
    ) {
      this.state.firstRun = nextProps.config.settings.global.firstRun;
    }
  }

  render() {
    return (
      <div className="TitleScreenContainer">
        <div className="TitleScreen">
          <div className="LogoWrapper">
            <div className="Logo FadeInElement" />
          </div>
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
