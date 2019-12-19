import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import { hashHistory } from "react-router";
import atob from "atob";
import { basename } from "path"

// this is taken from braid
const VERSION_REGEX = /^(.*?)(?:-(?:(?:\d|\.)+))\.jar?$/;

class Cordapp extends Component {

  constructor(props) {
    super(props);
    this.state = Cordapp.getStateFromProps(this.state.props);
  }

  componentDidMount(){
    this.refresh();
  }

  refresh() { }

  static getStateFromProps(props) {
    const cordapp = atob(props.params.cordapp);
    return {
      cordapp,
      nickname: VERSION_REGEX.exec(basename(cordapp))[1].toLowerCase()
    };
  }

  static getDerivedStateFromProps(props) {
    if (props.params.cordapp !== this.props.params.cordapp){
      return Cordapp.getStateFromProps(props);
    }
    return null;
  }

  render() {
    return (
      <div>
        <main>
          <div>
            <button className="Button" onClick={hashHistory.goBack}>
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
        </div>
      </div>    
    );
  }
}

export default connect(
  Cordapp,
  "config"
);
