import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import { hashHistory } from "react-router";
import atob from "atob";

class Cordapp extends Component {
  componentDidMount(){
    this.refresh();
  }

  refresh() {
  }
  constructor(props) {
    super(props);

    this.state = {results:{}};
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
