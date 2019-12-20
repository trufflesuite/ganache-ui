// import { Link } from "react-router-dom";
// import btoa from "btoa";
import React, { PureComponent } from "react";
import { basename } from "path"

// this is taken from braid
const VERSION_REGEX = /^(.*?)(?:-(?:(?:\d|\.)+))\.jar?$/;

class CordAppLink extends PureComponent {
  render() {
    const cordapp = this.props.cordapp;
    const workspace = this.props.workspace;
    const nodes = workspace.nodes.filter(node => node.cordapps.includes(cordapp));
    const length = nodes.length;
    return (
      // <Link to={`/corda/cordapps/${btoa(cordapp)}`} className="DataRow corda-cordapp-link">
      <div className="DataRow corda-cordapp-link">
        <div>
          <div className="Label">Name</div>
          <div className="Value">{VERSION_REGEX.exec(basename(cordapp))[1].toLowerCase()}</div>
        </div>
        <div className="corda-cordapplink-installed-on">
          <div className="Label">Installed On</div>
          <div className="Value">{length} node{length === 1 ? "" : "s"}</div>
        </div>
      </div>
      // </Link>
    );
  }
}

export default CordAppLink;
