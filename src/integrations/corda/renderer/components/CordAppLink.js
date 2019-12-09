import { Link } from "react-router";
import React, { PureComponent } from "react";
import btoa from "btoa";

class CordAppLink extends PureComponent {
  render() {
    const cordapp = this.props.cordapp;
    return (
      <Link to={`/corda/cordapps/${btoa(cordapp)}`} className="DataRow">
        <div>
          <div className="Label">Name</div>
          <div className="Value">{cordapp}</div>
        </div>
      </Link>
    );
  }
}

export default CordAppLink;
