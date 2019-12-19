import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import CordAppLink from "../components/CordAppLink";

class Cordapps extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Nodes DataRows">
        <main>
          {this.props.config.settings.workspace.projects.map(cordapp => {
            return (<CordAppLink key={cordapp} cordapp={cordapp} workspace={this.props.config.settings.workspace}>{cordapp}</CordAppLink>);
          })}
        </main>
      </div>
    );
  }
}

export default connect(
  Cordapps,
  "config"
);
