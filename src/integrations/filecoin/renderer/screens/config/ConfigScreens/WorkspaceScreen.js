import React, { Component } from "react";

class WorkspaceScreen extends Component {
  state = { selectedIdx: null };

  validateChange = e => {
    this.props.validateChange(e, {});
  };

  render() {
    const { name } = this.props.config.settings.workspace;
    return (
      <div>
        <h2>WORKSPACE</h2>
        <section>
          <h4>WORKSPACE NAME</h4>
          <div className="Row">
            <div className="RowItem">
              <input
                name="workspace.name"
                type="text"
                value={name}
                disabled={this.props.config.settings.workspace.isDefault}
                onChange={this.validateChange}
              />
            </div>
            <div className="RowItem">
              <p>A friendly name for this workspace.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default WorkspaceScreen;
