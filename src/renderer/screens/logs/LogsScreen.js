import React, { Component } from "react";
import connect from "../helpers/connect";
import LogContainerLazy from "./LogContainerLazy";
import { CellMeasurerCache } from "react-virtualized";

class Logs extends Component {
  constructor() {
    super();
  }

  caches = new Map();

  render() {
    const context = this.props.match.params.context || "default";

    let logCache;
    if (this.caches.has(context)) {
      logCache = this.caches.get(context);
    } else {
      logCache = new CellMeasurerCache({
        defaultHeight: 50,
        fixedWidth: true,
      });
      this.caches.set(context, logCache);
    }

    return (
      <div className="LogsScreen">
        <main>
          <LogContainerLazy cache={logCache} context={context} />
        </main>
      </div>
    );
  }
}

export default connect(Logs, "config");
