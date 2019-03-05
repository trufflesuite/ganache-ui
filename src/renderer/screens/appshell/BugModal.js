import React, { Component } from "react";
import { shell } from "electron";
const { app } = require("electron").remote;

import connect from "../helpers/connect";
import { sanitizeError, sanitizePaths } from "../helpers/sanitize.js";

import * as Workspaces from "../../../common/redux/workspaces/actions";

import Modal from "../../components/modal/Modal";

import BugIcon from "../../icons/errorant.svg";

class BugModal extends Component {
  constructor() {
    super();
    this.scrollDedupeTimeout = null;
  }

  // grabs the last 175 log lines as a string formatted for inclusion as a github issue
  renderAndSanitizeLogLines(existingBody) {
    let result = "";
    let logs = "";

    if (
      this.props.logs &&
      this.props.logs.lines &&
      this.props.logs.lines.length > 0
    ) {
      let maxLines = -175; // negative because Array.slice -- we want the last 175 lines, not the first 175

      // GitHub has a max URL length of ~8KiB, so we truncate logs to fit within that
      do {
        logs = _getLastNLogLines(maxLines, this.props.logs);
        result =
          "\n" +
          "\n" +
          "APPLICATION LOG:\n" +
          "```\n" +
          `${sanitizePaths(logs)}\n` +
          "```";
        maxLines++; // reduces number of lines we get next time
      } while (encodeURIComponent(existingBody + result).length > 7500);
    }
    return result;
  }

  renderIssueBody(sanitizedSystemError) {
    let issueBody =
      "<!-- Please give us as much detail as you can about what you were doing at the time of the error, and any other relevant information -->\n" +
      "\n" +
      "\n" +
      `PLATFORM: ${process.platform}\n` +
      `GANACHE VERSION: ${app.getVersion()}\n` +
      "\n" +
      "EXCEPTION:\n" +
      "```\n" +
      `${sanitizedSystemError}\n` +
      "```";

    const sanitizedLogLines = this.renderAndSanitizeLogLines(issueBody);
    if (sanitizedLogLines) {
      issueBody += sanitizedLogLines;
    }
    return encodeURIComponent(issueBody).replace(/%09/g, "");
  }

  render() {
    // in the future we can use the info on the systemError object to implement
    // a feature which searches for existing github issues rather than always
    // submitting a new one

    let unsanitizedSystemError =
      this.props.systemError.stack || this.props.systemError;
    let sanitizedSystemError = "";

    if (unsanitizedSystemError) {
      sanitizedSystemError = sanitizeError(unsanitizedSystemError);
    }

    return (
      <Modal className="BugModal">
        <section className="Bug">
          <BugIcon /*size={192}*/ />
          <h4>Uh Oh... That's a bug.</h4>
          <p>
            Ganache encountered an error. Help us fix it by raising a GitHub
            issue!
            <br />
            <br /> Mention the following error information when writing your
            ticket, and please include as much information as possible. Sorry
            about that!
          </p>
          <textarea disabled={true} value={sanitizedSystemError} />
          <footer>
            <button
              onClick={() => {
                const title = encodeURIComponent(
                  `System Error when running Ganache ${app.getVersion()} on ${
                    process.platform
                  }`,
                );

                const body = this.renderIssueBody(sanitizedSystemError);

                shell.openExternal(
                  `https://github.com/trufflesuite/ganache/issues/new?title=${title}&body=${body}`,
                );
              }}
            >
              Raise Github Issue
            </button>
            <button
              onClick={() => {
                this.props.dispatch(Workspaces.closeWorkspace());
              }}
            >
              RELAUNCH
            </button>
          </footer>
        </section>
      </Modal>
    );
  }
}

function _getLastNLogLines(maxLines, logs) {
  let firstLogTime = logs.lines[0].time.getTime();
  return logs.lines
    .slice(maxLines)
    .map(v => `T+${v.time.getTime() - firstLogTime}ms: ${v.line}`)
    .join("\n");
}

export default connect(BugModal);
