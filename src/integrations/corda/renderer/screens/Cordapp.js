import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import { hashHistory } from "react-router";
import atob from "atob";

class Cordapp extends Component {
  refresh() {
  }
  constructor(props) {
    super(props);

    this.state = {results:{}};

    this.refresh();
  }

  render() {
    // if(this.state.results.states === undefined){
    //   return (<div>Loading...</div>);
    // } else if(this.state.results.states.length === 0){
    //   return (<div>Couldn&apos;t locate Cordapp {this.props.params.txhash}</div>);
    // }
    return (
      <div>
        <main>
          <div>
            <button className="Button" onClick={hashHistory.goBack}>
              &larr; Back
            </button>
            <div>
              CordApp {atob(this.props.params.cordapp)}
            </div>
          </div>
        </main>
      </div>    
    );
  }
}

export default connect(
  Cordapp,
  "config"
);
