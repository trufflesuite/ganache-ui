import React, { Component } from "react";
import routes from "./routes";
import { ConnectedRouter } from "connected-react-router";

class App extends Component {
  render() {
    return (<ConnectedRouter history={this.props.history}>{routes}</ConnectedRouter>);
  }
}

export default App;
