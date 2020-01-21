import React, { Component } from "react";

import GoogleAnalytics from "../../../../../../renderer/components/google-analytics/GoogleAnalytics"

const VALIDATIONS = {
  "workspace.postgresPort": {
    allowedChars: /^\d*$/,
    min: 1024,
    max: 65536
  }
};

class AdvancedScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      postgresPort: props.config.settings.workspace.postgresPort,
    };
  }

  validateChange = e => {
    this.props.validateChange(e, VALIDATIONS);
  }

  render() {
    return (
      <div>
        <h2>Database</h2>
        <section>
          <h4><label htmlFor="postgresPort">Postgres Port</label></h4>
          <div className="Row">
            <div className="RowItem">
              <input
                id="postgresPort"
                type="number"
                min={VALIDATIONS["workspace.postgresPort"].min}
                max={VALIDATIONS["workspace.postgresPort"].max}
                name="workspace.postgresPort"
                value={this.props.config.settings.workspace.postgresPort}
                onChange={this.validateChange}
              />
              {this.props.validationErrors["workspace.postgresPort"] && (
                <p className="ValidationError">
                  Must be a valid number that is at least {VALIDATIONS["workspace.postgresPort"].min} and at most {VALIDATIONS["workspace.postgresPort"].max}
                </p>
              )}
            </div>
            <div className="RowItem">
              <p>What port should postgres use?</p>
            </div>
          </div>
        </section>
        <GoogleAnalytics googleAnalyticsTracking={this.props.config.settings.global.googleAnalyticsTracking} handleInputChange={this.props.handleInputChange} />
      </div>
    );
  }
}

export default AdvancedScreen;
