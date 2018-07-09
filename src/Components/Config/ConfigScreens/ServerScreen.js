import React, { Component } from 'react'

import OnlyIf from '../../../Elements/OnlyIf'

const VALIDATIONS = {
  "server.hostname": {
    format: /(^localhost$)|(^\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b$)/,
  },
  "server.port": {
    allowedChars: /^\d*$/,
    min: 1025,
    max: 65535
  },
  "server.network_id": {
    allowedChars: /^\d*$/,
    min: 1,
    max: Number.MAX_SAFE_INTEGER
  },
  "server.blocktime": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 200,
    canBeBlank: true
  }
}

class ServerScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      automine: typeof props.settings.workspace.server.blocktime == "undefined" 
    }
  }

  toggleAutomine = () => {
    var newValue = !this.state.automine

    // Remove blocktime value if we turn automine on
    if (newValue == true) {
      delete this.props.settings.workspace.server.blocktime

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "server.blocktime",
          value: ""
        }
      })
    }

    this.setState({
      automine: !this.state.automine
    })
  }

  validateChange = (e) => {
    this.props.validateChange(e, VALIDATIONS)
  }

  render () {
    const ganachePortStatus = {status: "clear"}
    const portIsBlocked = false
    // const { ganachePortStatus } = this.props.testRpcState
    // const portIsBlocked =
    //   ganachePortStatus.status === 'blocked' &&
    //   ganachePortStatus.pid !== undefined &&
    //   !ganachePortStatus.pid[0].name.toLowerCase().includes('ganache') &&
    //   !ganachePortStatus.pid[0].name.toLowerCase().includes('electron')

    return (
      <div>
        <h2>SERVER</h2>

        <section>
          <h4>HOSTNAME</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                type="text"
                name="server.hostname"
                value={this.props.settings.workspace.server.hostname}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.hostname"] &&
                <p className="ValidationError">Must be a valid IP address or "localhost"</p>}
            </div>
            <div className="RowItem">
              <p>
                The server will accept RPC connections on the following host and port.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>PORT NUMBER</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                type="number"
                name="server.port"
                value={this.props.settings.workspace.server.port}
                onChange={e => {
                 // this.props.appCheckPort(e.target.value)
                  this.validateChange(e)
                }}
              />

              {this.props.validationErrors["server.port"] &&
                <p className="ValidationError">Must be &gt; 1000 and &lt; 65535.</p>}
            </div>
            <div className="RowItem">
              <p>
                &nbsp;
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>NETWORK ID</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                type="number"
                name="server.network_id"
                value={this.props.settings.workspace.server.network_id}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["server.network_id"] &&
                <p className="ValidationError">
                  Must be &gt; 1
                </p>}
            </div>
            <div className="RowItem">
              <p>
                Internal blockchain identifier of Ganache server.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4>AUTOMINE</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="automine"
                  id="Automine"
                  onChange={this.toggleAutomine}
                  checked={this.state.automine}
                />
                <label htmlFor="Automine">AUTOMINE ENABLED</label>
              </div>
            </div>
            <div className="RowItem">
              <p>
                Process transactions instantaneously.
              </p>
            </div>
          </div>
        </section>

        <OnlyIf test={!this.state.automine}>
          <section>
            <h4>MINING BLOCK TIME (SECONDS)</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="server.blocktime"
                  type="text"
                  value={this.props.settings.workspace.server.blockTime}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors["server.blocktime"] &&
                  <p className="ValidationError">Must be &gt; 1 and &lt; 200</p>}
              </div>
              <div className="RowItem">
                <p>
                  The number of seconds to wait between mining new blocks and
                  transactions.
                </p>
              </div>
            </div>
          </section>
        </OnlyIf>

        <OnlyIf test={this.state.automine}>
          <section>
            <h4>ERROR ON TRANSACTION FAILURE</h4>
            <div className="Row">
              <div className="RowItem">
                <div className="Switch">
                  <input
                    type="checkbox"
                    name="server.vmErrorsOnRPCResponse"
                    id="server.vmErrorsOnRPCResponse"
                    defaultChecked={this.props.settings.workspace.server.vmErrorsOnRPCResponse}
                    onChange={this.props.handleInputChange}
                  />
                  <label htmlFor="server.vmErrorsOnRPCResponse">ENABLED</label>
                </div>
              </div>
              <div className="RowItem">
                <p>
                  When transactions fail, throw an error. If disabled, transaction failures will only be detectable via the "status" flag in the transaction receipt. Disabling this feature will make Ganache handle transaction failures like other Ethereum clients.
                </p>
              </div>
            </div>
          </section>
        </OnlyIf>
      </div>
    )
  }
}

export default ServerScreen
