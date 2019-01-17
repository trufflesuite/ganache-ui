import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import ElectronCookies from "@exponent/electron-cookies";

import connect from "../helpers/connect";

import * as AppShellActions from "../../../common/redux/appshell/actions";

import TopNavbar from "./TopNavbar";
import BugModal from "./BugModal";
import ErrorModal from "../../components/modal/ErrorModal";
import UpdateModal from "../auto-update/UpdateModal";

import OnlyIf from "../../components/only-if/OnlyIf";

ElectronCookies.enable({
  origin: "http://truffleframework.com/ganache",
});

class AppShell extends Component {
  constructor(props) {
    super(props);
    this.scrollDedupeTimeout = null;
  }

  _handleScroll = values => {
    let scrollPosition = "top";

    if (values.top === 1) {
      scrollPosition = "bottom";
    } else if (values.top > 0) {
      scrollPosition = "middle";
    } else {
      scrollPosition = "top";
    }

    if (this.props.appshell.scrollPosition !== scrollPosition) {
      this.props.dispatch(AppShellActions.setScrollPosition(scrollPosition));
    }
  };

  setScrollTop = scrollTop => {
    this.refs.shellcontainer.scrollTop = scrollTop;
  };

  onCloseError() {
    alert("onCloseError");
  }

  onCloseFatalErrorModal = () => {};

  render() {
    return (
      <div className="AppShell">
        <TopNavbar {...this.props} />

        <div className="ShellContainer" ref="shellcontainer">
          <Scrollbars
            className="scrollBar"
            onScrollFrame={this._handleScroll.bind(this)}
          >
            {this.props.children}
          </Scrollbars>
        </div>
        <OnlyIf
          test={
            this.props.core.systemError != null && this.props.core.showBugModal
          }
        >
          <BugModal
            systemError={this.props.core.systemError}
            logs={this.props.logs}
          />
        </OnlyIf>
        <OnlyIf test={this.props.core.modalError != null}>
          <ErrorModal modalError={this.props.core.modalError} />
        </OnlyIf>
        <OnlyIf
          test={!this.props.core.systemError && this.props.autoUpdate.showModal}
        >
          <UpdateModal />
        </OnlyIf>
      </div>
    );
  }
}

export default connect(
  AppShell,
  "appshell",
  "core",
  "config",
  "logs",
  "autoUpdate",
);
