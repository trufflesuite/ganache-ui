import React, { Component } from "react";

import LogContainer from "./LogContainer";
import LogContainerLazy from "./LogContainerLazy";

const isLazy = true;

class Logs extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="LogsScreen">
        <main>{isLazy ? <LogContainerLazy /> : <LogContainer />}</main>
      </div>
    );
  }
}

export default Logs;
