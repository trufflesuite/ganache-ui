import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import CordAppLink from "../components/CordAppLink";

class Cordapps extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let cordapps;
    const projects = this.props.config.settings.workspace.projects;
    if (projects.length === 0) {
      cordapps = (<div className="Waiting Waiting-Padded">No CorDapps</div>);
    } else {
      cordapps = projects.map(cordapp => {
        return (<CordAppLink key={cordapp} cordapp={cordapp} workspace={this.props.config.settings.workspace}>{cordapp}</CordAppLink>);
      });
    }
    
    return (
      <div className="Nodes DataRows">
        <main>{ cordapps }</main>
      </div>
    );
  }
}

export default connect(
  Cordapps,
  "config"
);
