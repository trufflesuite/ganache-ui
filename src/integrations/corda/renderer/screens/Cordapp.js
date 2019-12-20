import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import atob from "atob";
import { basename } from "path"
import NodeLink from "../components/NodeLink";

// this is taken from braid
const VERSION_REGEX = /^(.*?)(?:-(?:(?:\d|\.)+))\.jar?$/;

class Cordapp extends Component {

  constructor(props) {
    super(props);
    this.state = Cordapp.getStateFromProps(this.props);
  }

  componentDidMount(){
    this.refresh();
  }

  refresh() {
    
  }

  static getStateFromProps(props) {
    const cordapp = atob(props.match.params.cordapp);
    return {
      cordapp,
      nickname: VERSION_REGEX.exec(basename(cordapp))[1].toLowerCase()
    };
  }

  static getDerivedStateFromProps(props) {
    return Cordapp.getStateFromProps(props);
  }

  render() {
    const cordapp = this.state.cordapp;
    const nodes = this.props.config.settings.workspace.nodes.filter(node => node.cordapps.includes(cordapp));

    return (
      <div>
        <main>
          <div>
            <button className="Button" onClick={this.props.history.goBack}>
              &larr; Back
            </button>
            <div>
              {this.state.nickname}
            </div>
          </div>
        </main>
        <div>
          <div>
            <div>Path</div>
            <div>{this.state.cordapp}</div>
          </div>
          <div>
            <div>
              <div>Installed On</div>
            </div>
            <div>
              {nodes.map(node => {
                return (<NodeLink key={`node-${node.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={node} />);
              })}
            </div>
          </div>

          <div>
            <div>
              <div>Transactions</div>
            </div>
            <div>
              {nodes.map(node => {
                return (<NodeLink key={`node-${node.safeName}`} postgresPort={this.props.config.settings.workspace.postgresPort} node={node} />);
              })}
            </div>
          </div>
        </div>
      </div>    
    );
  }
}

export default connect(
  Cordapp,
  "config"
);
