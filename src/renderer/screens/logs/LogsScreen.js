import React, { Component } from "react";
import { Link } from "react-router";
import connect from "../helpers/connect";

import LogContainerLazy from "./LogContainerLazy";

import {
  CellMeasurerCache,
} from "react-virtualized";

class Logs extends Component {
  constructor() {
    super();
  }

  caches = new Map()

  render() {
    const links = [];
    if (this.props.config.settings.workspace.nodes) {
      links.push(<Link to={`/logs`} key="default">General</Link>);
      [...this.props.config.settings.workspace.nodes, ...this.props.config.settings.workspace.notaries].forEach((node => {
        links.push(<Link key={node.safeName} to={`/logs/${node.safeName}`}>{node.name}</Link>);
      }));
    }
    const context = this.props.params.context || "default";

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
        {links.length > 0 ? links : ""}
        <main><LogContainerLazy cache={logCache} context={context} /></main>
      </div>
    );
  }
}

export default connect(
  Logs,
  "config",
);
