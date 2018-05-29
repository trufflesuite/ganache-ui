import React, { Component } from 'react'
import connect from '../../Helpers/connect'
import OnlyIf from '../../../Elements/OnlyIf'
import FilePicker from '../../../Elements/FilePicker'

const VALIDATIONS = {
  "logDirectory": {
    canBeBlank: false,
    allowedChars: /^(?!.*Select a Directory).+$/
  }
}

class GanacheScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      logDirectory: props.settings.logDirectory
    }
  }

  toggleOutputToLogs = e => {
    if (this.state.logDirectory == null) {
      // this setting was turned off, turn it on
      this.state.logDirectory = "Select a Directory"
    }
    else {
      // this setting was turned on and set, turn it off by setting to null
      this.state.logDirectory = null
    }

    this.validateChange(e)
  }

  changeLogDirectory = (value, e) => {
    this.state.logDirectory = value

    this.validateChange(e)
  }

  validateChange = e => {
    if (e.target.name === "logDirectory") {
      // the value to validate isn't the value of the HTML element
      e = {
        "target": {
          "name": "logDirectory",
          "value": this.state.logDirectory
        }
      };
    }

    let tempValidations = JSON.parse(JSON.stringify(VALIDATIONS));

    if (this.state.logDirectory === null && "logDirectory" in tempValidations) {
      // if the switch is off for logging to file, then don't validate
      tempValidations.logDirectory = null;
    }

    this.props.validateChange(e, VALIDATIONS)
  }

  render () {
    return (
      <div>
        <h2>LOGGING</h2>
        <section>
          <h4>OUTPUT LOGS TO FILE</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="logDirectory"
                  id="OutputToLogs"
                  checked={this.state.logDirectory != null}
                  onChange={this.toggleOutputToLogs}
                />
                <label htmlFor="OutputToLogs">OUTPUT LOGS TO FILE</label>
              </div>
            </div>
            <div className="RowItem">
              <p>
                Save logs to file.
              </p>
            </div>
          </div>
        </section>
        <OnlyIf test={this.state.logDirectory != null}>
          <section>
            <h4>LOG FILE DIRECTORY</h4>
            <div className="Row">
              <div className="RowItem">
                <FilePicker
                  id="Logdirectory"
                  name="logDirectory"
                  defaultValue="Select a Directory"
                  buttonValue="Pick a Folder"
                  directoriesOnly={true}
                  value={this.state.logDirectory}
                  onChangeFunction={(value, e) => this.changeLogDirectory(value, e)}
                />
                {this.props.validationErrors["logDirectory"] &&
                  <p className="ValidationError">Must select a directory or disable "Output Logs To File"</p>}
              </div>
              <div className="RowItem">
                <p>Path to a directory to save the timestamped log files. A separate file will be generated everytime you restart Ganache. It is recommended to create a directory just for these logs.</p>
              </div>
            </div>
          </section>
        </OnlyIf>
        <section>
          <h4>VERBOSE LOGS</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="server.verbose"
                  id="Verbose"
                  onChange={this.props.handleInputChange}
                  checked={this.props.settings.server.verbose}
                />
                <label htmlFor="Verbose">Verbose Logs</label>
              </div>
            </div>
            <div className="RowItem">
              <p>
                Increase the log output.
              </p>
            </div>
          </div>
        </section>
        <h2>ANALYTICS</h2>
        <section>
          <h4>GOOGLE ANALYTICS</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="googleAnalyticsTracking"
                  id="GoogleAnalyticsTracking"
                  onChange={this.props.handleInputChange}
                  checked={this.props.settings.googleAnalyticsTracking == true}
                />
                <label htmlFor="GoogleAnalyticsTracking">
                  GOOGLE ANALYTICS
                </label>
              </div>
            </div>
            <div className="RowItem">
              <p>
                We use Google Analytics to track Ganache usage. This information helps us gain more insight into how Ganache is used. This tracking is anonymous. We do not track personally identifiable information, account data or private keys.{' '}
              </p>
            </div>
          </div>
        </section>
        {/* <section>
          <h4>CPU &amp; MEMORY PROFILING</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="cpuAndMemoryProfiling"
                  id="CpuAndMemoryProfiling"
                  onChange={this.props.handleInputChange}
                  checked={this.props.formState.cpuAndMemoryProfiling}
                />
                <label htmlFor="CpuAndMemoryProfiling">
                  CPU &amp; MEMORY PROFILING
                </label>
              </div>
            </div>
            <div className="RowItem">
              <p>
                Strictly for debugging Ganache. Dumps detailed metrics to a log
                file. Only enable if you are asked to by Truffle support.
              </p>
            </div>
          </div>
        </section> */}
      </div>
    )
  }
}

export default GanacheScreen
