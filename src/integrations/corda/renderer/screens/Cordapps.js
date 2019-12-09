import connect from "../../../../renderer/screens/helpers/connect";

import React, { Component } from "react";
import CordAppLink from "../components/CordAppLink";

class Cordapps extends Component {
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
      <div className="Nodes DataRows">
        <main>
          {this.props.config.settings.workspace.projects.map(cordapp => {
            return (<CordAppLink key={cordapp} cordapp={cordapp} />);
          })}
        </main>
      </div>
    );
  }
}

export default connect(
  Cordapps,
  "config"
);
