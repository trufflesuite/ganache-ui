import React, { Component } from 'react'

import connect from '../Helpers/connect'

import Modal from '../../Elements/Modal'

import BugIcon from '../../Elements/icons/errorant.svg'

import { sanitizeError, sanitizePaths } from '../Helpers/sanitize.js'

import app from '../../Kernel/app'

class BugModal extends Component {
  constructor () {
    super()
    this.scrollDedupeTimeout = null
  }

  // grabs the last 500 log lines as a string formatted for inclusion as a github issue
  renderAndSanitizeLogLines () {
    let result = ''
    if (this.props.logs && this.props.logs.lines && this.props.logs.lines.length > 0) {
      let maxLines = -175 // negative because Array.slice -- we want the last 175 lines, not the first 175

      // GitHub has a max URL length of ~8KiB, so we truncate logs to fit within that
      while (encodeURIComponent(result = _getLastNLogLines(maxLines, this.props.logs)).length > 7500) {
        maxLines++ // reduces number of lines we get next time
      }
    }
    return sanitizePaths(result)
  }

  renderIssueBody(sanitizedSystemError, sanitizedLogLines) {
    let issueBody =
      "<!-- Please give us as much detail as you can about what you were doing at the time of the error, and any other relevant information -->\n" +
      "\n" +
      "\n" +
      `PLATFORM: ${app.getPlatform()}\n` +
      `GANACHE VERSION: ${app.getVersion()}\n` +
      "\n" +
      "EXCEPTION:\n" +
      "```\n" +
      `${sanitizedSystemError}\n` +
      "```"

    if (sanitizedLogLines) {
      issueBody += "\n" +
        "\n" +
        "APPLICATION LOG:\n" +
        "```\n" +
        `${sanitizedLogLines}\n` +
        "```"
    }
    return encodeURIComponent(issueBody).replace(/%09/g, '')
  }

  render () {
    // in the future we can use the info on the systemError object to implement
    // a feature which searches for existing github issues rather than always
    // submitting a new one

    let unsanitizedSystemError = this.props.systemError.stack || this.props.systemError
    let sanitizedSystemError = ''
    let sanitizedLogLines = ''

    if (unsanitizedSystemError) {
      sanitizedSystemError = sanitizeError(unsanitizedSystemError)
      sanitizedLogLines = this.renderAndSanitizeLogLines()
    }

    return (
      <Modal className="BugModal">
        <section className="Bug">
          <BugIcon /*size={192}*/ />
          <h4>Uh Oh... That's a bug.</h4>
          <p>
            Ganache encountered an error. Help us fix it by raising a GitHub issue!<br /><br /> Mention the following error information when writing your ticket, and please include as much information as possible. Sorry about that!
            </p>
          <textarea disabled={true} value={sanitizedSystemError} />
          <footer>
            <button
              onClick={() => {
                const title = encodeURIComponent(
                  `System Error when running Ganache ${app.getVersion()} on ${app.getPlatform()}`
                )

                const body = this.renderIssueBody(sanitizedSystemError, sanitizedLogLines)

                app.openExternal(
                  `https://github.com/trufflesuite/ganache/issues/new?title=${title}&body=${body}`
                )
              }}
            >
              Raise Github Issue
            </button>
            <button onClick={app.relaunch}>
              RELAUNCH
            </button>
          </footer>
        </section>
      </Modal>
    )
  }
}

function _getLastNLogLines(maxLines, logs) {
  let firstLogTime = logs.lines[0].time.getTime()
  return logs.lines
    .slice(maxLines)
    .map(v => `T+${v.time.getTime() - firstLogTime}ms: ${v.line}`)
    .join('\n')
}


export default connect(BugModal)
