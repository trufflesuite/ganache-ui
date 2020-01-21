import React, { PureComponent } from "react";

export default class HeaderBar extends PureComponent {
  render() {
    return (
      <>
        <h2>ANALYTICS</h2>
        <section>
          <h4>GOOGLE ANALYTICS</h4>
          <div className="Row">
            <div className="RowItem">
              <div className="Switch">
                <input
                  type="checkbox"
                  name="global.googleAnalyticsTracking"
                  id="GoogleAnalyticsTracking"
                  onChange={this.props.handleInputChange}
                  checked={
                    this.props.googleAnalyticsTracking ==
                    true
                  }
                />
                <label htmlFor="GoogleAnalyticsTracking">
                  GOOGLE ANALYTICS
                  </label>
              </div>
            </div>
            <div className="RowItem">
              <p>
                We use Google Analytics to track Ganache usage. This information
                helps us gain more insight into how Ganache is used. This
                tracking is anonymous. We do not track personally identifiable
                information, account data or private keys.
                  <br />
                Note: This setting is global and will persist between
                workspaces.
                </p>
            </div>
          </div>
        </section>
      </>
    );
  }
}
