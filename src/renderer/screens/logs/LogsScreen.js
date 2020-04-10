import React, { Component } from "react";
import { NavLink } from "react-router-dom";
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
      links.push(<NavLink title="General" exact activeClassName="corda-tab-selected" to={`/logs`} key="default" className="corda-tab">General</NavLink>);
      [...this.props.config.settings.workspace.nodes, ...this.props.config.settings.workspace.notaries].forEach((node => {
        links.push(<NavLink title={node.name} exact activeClassName="corda-tab-selected" key={node.safeName} to={`/logs/${node.safeName}`} className="corda-tab">{node.name}</NavLink>);
      }));
    }
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
        {links.length === 0 ? "" : (
          <div className="corda-tabs">
            {links}
          </div>
         )}
        <main><LogContainerLazy cache={logCache} context={context} /></main>
      </div>
    );
  }
}

export default connect(
  Logs,
  "config",
);
