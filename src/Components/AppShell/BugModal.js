import React, { Component } from 'react'

import connect from '../Helpers/connect'

import OnlyIf from '../../Elements/OnlyIf'
import Modal from '../../Elements/Modal'

import BugIcon from '../../Elements/icons/errorant.svg'

import { shell } from 'electron'

const { app } = require('electron').remote

class BugModal extends Component {
  constructor () {
    super()
    this.scrollDedupeTimeout = null
  }

  _getLastNLines(maxLines) {
    let firstLogTime = this.props.logs.lines[0].time.getTime()
    return this.props.logs.lines
      .slice(maxLines)
      .map(v => `T+${v.time.getTime() - firstLogTime}ms: ${v.line}`)
        .join('\n')
  }
  // grabs the last 500 log lines as a string formatted for inclusion as a github issue
  prepareLogLines () {
    let result = ''
    if (this.props.logs.lines) {
      let maxLines = -175

      // GitHub has a max URL length of ~8KiB, so we truncate logs to fit within that
      while (encodeURIComponent(result = this._getLastNLines(maxLines)).length > 7500) {
        maxLines++
      }

    }

    return result
  }

  // Remove any user-specific paths in exception messages
  sanitizePaths(message) {
    // Prepare our paths so we *always* will get a match no matter
    // path separator (oddly, on Windows, different errors will give
    // us different path separators)
    var appPath = app.getAppPath().replace(/\\/g, "/")

    // I couldn't figure out the regex, so a loop will do.
    while (message.indexOf(appPath) >= 0) {
      message = systemError.replace(appPath, "")
    }

    return message
  }

  render () {
    let systemError = this.props.core.systemError
    let logLines = ''
    if (systemError) {
      systemError = systemError.stack || systemError

      // avoid leaking details about the user's environment
      systemError = this.sanitizePaths(systemError)
      logLines = this.sanitizePaths(this.prepareLogLines())
    }

    return (
      <OnlyIf test={systemError != null}>
        <Modal className="BugModal">
          <section className="Bug">
            <BugIcon /*size={192}*/ />
            <h4>Uh Oh... That's a bug.</h4>
            <p>
              Ganache encountered an error. Help us fix it by raising a GitHub issue!<br /><br /> Mention the following error information when writing your ticket, and please include as much information as possible. Sorry about that!
              </p>
            <textarea disabled={true} value={systemError} />
            <footer>
              <button
                onClick={() => {
                  const title = encodeURIComponent(
                    `System Error when running Ganache ${app.getVersion()} on ${process.platform}`
                  )

                  const body = encodeURIComponent(
                    `<!-- Please give us as much detail as you can about what you were doing at the time of the error, and any other relevant information -->

PLATFORM: ${process.platform}
GANACHE VERSION: ${app.getVersion()}

EXCEPTION:
\`\`\`
${systemError}
\`\`\`

APPLICATION LOG:
\`\`\`
${logLines}
\`\`\``
                  ).replace(/%09/g, '')

                  shell.openExternal(
                    `https://github.com/trufflesuite/ganache/issues/new?title=${title}&body=${body}`
                  )
                }}
              >
                Raise Github Issue
                </button>
              <button
                onClick={() => {
                  app.relaunch()
                  app.exit()
                }}
              >
                RELAUNCH
                </button>
            </footer>
          </section>
        </Modal>
      </OnlyIf>
    )
  }
}

export default connect(BugModal)