import React, { Component } from "react";
import OnlyIf from "../../../../../../renderer/components/only-if/OnlyIf";
import connect from "../../../../../../renderer/screens/helpers/connect";
import { FilecoinOptionsConfig } from "@ganache/filecoin-options";

const VALIDATIONS = {
  "workspace.server.miner.blockTime": {
    allowedChars: /^\d*$/,
    min: 1,
    max: 200,
  }
};

class MinerScreen extends Component {
  constructor(props) {
    super(props);

    const mineDefined = typeof props.config.settings.workspace.server.miner.mine !== "undefined";
    const blockTimeDefined = typeof props.config.settings.workspace.server.miner.blockTime !== "undefined";

    const hasProviderOptions = Object.keys(props.core.options).length > 1;
    const defaults = FilecoinOptionsConfig.normalize({});
    const blockTime = this.props.config.settings.workspace.server.miner.blockTime || (hasProviderOptions ? this.props.core.options.miner.blockTime : defaults.miner.blockTime);
    this.state = {
      mineDefined,
      blockTimeDefined,
      defaultMinerMine: defaults.miner.mine,
      mine: this.props.config.settings.workspace.server.miner.mine || (hasProviderOptions ? this.props.core.options.miner.mine : defaults.miner.mine),
      autoMine: blockTime === 0,
    };
  }

  toggleMine = () => {
    const newValue = !this.state.mine;

    if (!this.state.mineDefined && newValue === this.state.defaultMinerMine) {
      // if our current `Settings` file doesn't specify the `mine` field,
      // and we're reverting a change, then we should still act as if
      // we're not defining it (and therefore using @ganache/filecoin-option's defaults)
      delete this.props.config.settings.workspace.server.miner.mine;

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "workspace.server.miner.mine",
          value: undefined,
        },
      });
    } else {
      this.validateChange({
        target: {
          name: "workspace.server.miner.mine",
          value: newValue,
        },
      });
    }

    this.setState({
      mine: newValue,
    });
  };

  toggleAutoMine = () => {
    const newValue = !this.state.autoMine;

    // Remove blockTime value if we turn autoMine on
    if (newValue === true) {
      delete this.props.config.settings.workspace.server.miner.blockTime;

      // Rerun validations now that value has been deleted
      this.validateChange({
        target: {
          name: "workspace.server.miner.blockTime",
          value: undefined,
        },
      });
    } else if (newValue === false) {
      this.validateChange({
        target: {
          name: "workspace.server.miner.blockTime",
          value: "30",
          attributes: {
            "data-type": "number",
          },
        },
      });
    }

    this.setState({
      autoMine: !this.state.autoMine,
    });
  };

  cleanNumber(value) {
    if (isNaN(value) || value === null || value === undefined) {
      return "";
    } else {
      return value;
    }
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS);
    this.forceUpdate();
  };

  render() {
    return (
      <div>
        {this.props.config.validationErrors["workspace.server.chain"] && (
          <div>
            <p className="ValidationError">{this.props.config.validationErrors["workspace.server.chain"]}</p>
            <br/>
          </div>
        )}
        <h2>MINER</h2>

        <section>
          <h4>MINE</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="mine"
                  id="Mine"
                  onChange={this.toggleMine}
                  checked={this.state.mine}
                />
                <label htmlFor="Mine">MINING ENABLED</label>
              </div>
            </div>
            <div className="RowItem">
              <p>
                Enable mining. Set to `false` to pause the miner. If set to `false`,
                calling `Ganache.MineTipset` method will still mine a tipset/block.
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
                  name="autoMine"
                  id="AutoMine"
                  onChange={this.toggleAutoMine}
                  checked={this.state.autoMine}
                />
                <label htmlFor="AutoMine">AUTOMINE ENABLED</label>
              </div>
            </div>
            <div className="RowItem">
              <p>Process transactions instantaneously.</p>
            </div>
          </div>
        </section>

        <OnlyIf test={!this.state.autoMine}>
          <section>
            <h4>MINING BLOCK TIME (SECONDS)</h4>
            <div className="Row">
              <div className="RowItem">
                <input
                  name="workspace.server.miner.blockTime"
                  type="text"
                  data-type="number"
                  value={this.cleanNumber(
                    this.props.config.settings.workspace.server.miner.blockTime,
                  )}
                  onChange={this.validateChange}
                />
                {this.props.validationErrors["workspace.server.miner.blockTime"] && (
                  <p className="ValidationError">
                    Must be an integer &gt; 1 and &lt; 200
                  </p>
                )}
              </div>
              <div className="RowItem">
                <p>
                  The number of seconds to wait between mining new tipsets, blocks,
                  and transactions.
                </p>
              </div>
            </div>
          </section>
        </OnlyIf>
      </div>
    );
  }
}

export default connect(
  MinerScreen,
  ["filecoin.core", "core"]
);
