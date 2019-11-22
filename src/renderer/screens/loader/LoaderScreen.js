import React, { Component } from "react";

import MDSpinner from "react-md-spinner";
import connect from "../helpers/connect";
import OnlyIf from "../../components/only-if/OnlyIf";
import BugModal from "../appshell/BugModal";
import Logo from "../../components/logo/Logo";

class LoaderScreen extends Component {
  
  constructor(){
    super();
    this.state = {progress: this.props && this.props.core ? this.props.core.progress : "", lastProgressUpdateTime: 0};
    this.queued = [];
    this.timer = null;
    this.minTimeOnprogressUpdate = 1000;
  }
  progressIsReadyForUpdate(now) {
    return this.queued.length === 0 && (this.state.lastProgressUpdateTime == 0 || ((this.state.lastProgressUpdateTime + this.minTimeOnprogressUpdate) <= now));
  }
  componentWillReceiveProps(nextProps) {
    const currentProgress = this.state.progress;
    if (nextProps.core.progress !== currentProgress) {
      const now = Date.now();
      if (this.progressIsReadyForUpdate(now)) {
        this.setState({ progress: nextProps.core.progress, lastProgressUpdateTime: now });
      } else {
        const length = this.queued.push(nextProps.core.progress);

        // if there was already something in the queue we don't need to setTimeout here.
        if (length === 1) {
          const waitFor = Math.min(now - this.state.lastProgressUpdateTime, this.minTimeOnprogressUpdate);
          this.timer = setTimeout(function update() {
            let progress;
            do {
              progress = this.queued.shift();
            } while(progress === this.state.progress && this.queued.length > 0);

            if (progress !== this.state.progress) {
              const now = Date.now();
              this.setState({ progress, lastProgressUpdateTime:  now}, () => {
                if (this.queued.length > 0) {
                  this.timer = setTimeout(update.bind(this), this.minTimeOnprogressUpdate);
                }
              });
            }
          }.bind(this), waitFor);
        }
      }
    }
  }
  componentWillUnmount(){
    clearTimeout(this.timer);
  }
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
          <Logo fadeInElement={true} />
          <h4 className="LoaderProgress">{this.state.progress}</h4>
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
