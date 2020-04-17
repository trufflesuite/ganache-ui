 import { Link } from "react-router-dom";
import btoa from "btoa";
import React, { PureComponent } from "react";
import { cordaNickname } from "../utils/nickname";

class CordAppLink extends PureComponent {
  render() {
    const cordapp = this.props.cordapp;
    const workspace = this.props.workspace;
    const nodes = [...workspace.nodes, ...workspace.notaries].filter(node => (node.cordapps || []).includes(cordapp));
    const length = nodes.length;
    const filename = cordaNickname(cordapp);
    return (
      <Link to={`/corda/cordapps/${btoa(cordapp)}`} className="DataRow corda-cordapp-link">
        
          <div>
            <div className="Label">Name</div>
            <div className="Value">{filename}</div>
          </div>
          <div className="corda-cordapplink-installed-on">
            <div className="Label">Installed On</div>
            <div className="Value">{length} node{length === 1 ? "" : "s"}</div>
          </div>
        
      </Link>
    );
  }
}

export default CordAppLink;
