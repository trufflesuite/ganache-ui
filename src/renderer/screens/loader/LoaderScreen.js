import React, { Component } from "react";

import MDSpinner from "react-md-spinner";
import connect from "../helpers/connect";
import OnlyIf from "../../components/only-if/OnlyIf";
import BugModal from "../appshell/BugModal";

class LoaderScreen extends Component {
  render() {
    return (
      <div className="LoaderScreenContainer">
        <div className="LoaderScreen">
          <MDSpinner
            singleColor="var(--primary-color)"
            size={200}
            borderSize={3}
            className="spinner"
            duration={2666}
          />
          <div className="LogoWrapper">
            <div className="Logo FadeInElement" />
          </div>
        </div>
        <OnlyIf
          test={
            this.props.core &&
            this.props.core.systemError != null &&
            this.props.core.showBugModal
          }
        >
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
  LoaderScreen,
  "core",
);
