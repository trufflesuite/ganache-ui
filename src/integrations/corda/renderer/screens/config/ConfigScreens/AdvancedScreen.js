import React, { Component } from "react";

import GoogleAnalytics from "../../../../../../renderer/components/google-analytics/GoogleAnalytics"

class AdvancedScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      postgresPort: props.config.settings.workspace.postgresPort,
    };
  }

  validateChange = e => {
    this.props.validateChange(e, {});
  }

  render() {
    return (
      <div>
        <h2>Database</h2>
        <section>
          <h4>Postgres Port</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                type="number"
                min="1024"
                mac="65535"
                name="workspace.postgresPort"
                id="postgresPort"
                value={this.props.config.settings.workspace.postgresPort}
                onChange={this.validateChange}
              />
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
