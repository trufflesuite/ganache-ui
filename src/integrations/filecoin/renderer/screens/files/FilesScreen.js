import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Files from "../../../common/redux/files/actions";
import FileList from "./FileList";

class FilesContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pollInterval: null
    };
  }

  componentDidMount() {
    this.props.dispatch(Files.addFilesToView());
    const pollInterval = setInterval(() => {
      this.props.dispatch(Files.addFilesToView());
    }, 5000);

    this.setState({
      pollInterval
    });
  }

  componentWillUnmount() {
    if (this.state.pollInterval) {
      clearInterval(this.state.pollInterval);
      this.setState({
        pollInterval: null
      });
    }
  }

  render() {
    return (
      <div className="FilesScreen">
        <header className="Header">
          <div>
            <h1>Pinned IPFS Files</h1>
          </div>
        </header>
        <FileList scrollPosition={this.props.scrollPosition} />
      </div>
    );
  }
}

export default connect(
  FilesContainer,
);
