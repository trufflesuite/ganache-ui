import connect from "../../../../renderer/screens/helpers/connect";

import { push } from "react-router-redux";
import React, { Component } from "react";
import btoa from "btoa";


class Cordapps extends Component {
  refresh() {
  }
  constructor(props) {
    super(props);

    this.state = {results:{}};

    this.refresh();
  }

  render() {
    return (
      <div>
        <main>
          <div>
            <div>
              CordApps
            </div>
            <ul>
              {this.props.config.settings.workspace.projects.map(cordapp => {
                const goToCordappDetails = () => {
                  this.props.dispatch(
                    push(`/corda/cordapp/${btoa(cordapp)}`),
                  );
                }
                return (<li key={cordapp} onClick={goToCordappDetails}>{cordapp}</li>);
              })}
            </ul>
          </div>
        </main>
      </div>
    );
  }
}

export default connect(
  Cordapps,
  "config"
);
