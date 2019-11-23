import React, { Component } from "react";

import MDSpinner from "react-md-spinner";
import connect from "../helpers/connect";
import OnlyIf from "../../components/only-if/OnlyIf";
import BugModal from "../appshell/BugModal";
import Logo from "../../components/logo/Logo";

class LoaderScreen extends Component {
  constructor(props){
    super(props);
    this.state = {progress: this.props.core.progress, lastProgressUpdateTime: Date.now()};
    this.queued = [];
    this.nextProgressUpdateTimer = null;
    this.MIN_TIME_EACH_PROGRESS_UPDATE = 2000;
    this.updateProgressWithNextThenQueue = this.updateProgressWithNextThenQueue.bind(this);
  }

  static defaultProps = {
    core: {
      progress: ""
    }
  }

  /**
   * Sets the nextProgress in the local state only if it is ready to recieve it.
   * Ready means: the queue is empty and the amount of time since the last progress
   * update is greater than our this.MIN_TIME_EACH_PROGRESS_UPDATE
   * @param {string} nextProgress 
   * @param {number} now 
   * @returns {boolean} `true` if `progress` was ready and set, `false` if not.
   */
  setProgressIfReady(nextProgress, now) {
    const isReady = this.queued.length === 0 && (this.state.lastProgressUpdateTime + this.MIN_TIME_EACH_PROGRESS_UPDATE <= now);
    if (isReady) this.setProgress(nextProgress, now);
    return isReady;
  }

  /**
   * Updates the local state `progress` with the next item in the queue
   * then starts a timer to set the item after that in the queue, if 
   * there is one. If the queue is empty when this is called `undefined` 
   * will be set. So don't do that.
   */
  updateProgressWithNextThenQueue() {
    // we need to grab the first item in the queue without shifting it off 
    // because setState is asyncronous and we rely on the value of
    // `this.state.progress` to determine if we add to the queue or not
    this.setProgress(this.queued[0], Date.now(), () => {
      this.queued.shift();
      if (this.queued.length === 0) return;
      this.nextProgressUpdateTimer = setTimeout(this.updateProgressWithNextThenQueue, this.MIN_TIME_EACH_PROGRESS_UPDATE);
    });
  }

  /**
   * Sets the progress value and the time it was updated in the local state
   * @param {string} progress 
   * @param {number} lastProgressUpdateTime 
   * @param {function} callback (optional)
   */
  setProgress(progress, lastProgressUpdateTime, callback) {
    this.setState({ progress, lastProgressUpdateTime }, callback);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const currentProgress = this.state.progress;
    const nextProgress = nextProps.core.progress;
    if (nextProgress === currentProgress) return;

    // if this new progress is the same as our current progress, throw it out
    if (nextProgress === currentProgress) return;

    const length = this.queued.length;
    const notEmpty = length > 0;
    // if this new progress is the same as the last queued progress, throw it out.
    if (notEmpty && nextProgress === this.queued[length - 1]) return;

    const now = Date.now();

    if (this.setProgressIfReady(nextProgress, now)) return;
    
    this.queued.push(nextProgress);

    // if there was already something in the queue we don't need to setTimeout here.
    if (notEmpty) return;

    const waitFor = Math.min(now - this.state.lastProgressUpdateTime, this.MIN_TIME_EACH_PROGRESS_UPDATE);
    this.nextProgressUpdateTimer = setTimeout(this.updateProgressWithNextThenQueue, waitFor);
  }

  componentWillUnmount(){
    clearTimeout(this.nextProgressUpdateTimer);
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
