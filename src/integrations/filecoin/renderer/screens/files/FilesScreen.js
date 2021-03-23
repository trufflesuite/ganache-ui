import React, { Component } from "react";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Files from "../../../common/redux/files/actions";
import FileList from "./FileList";

class FilesContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(Files.addFilesToView());
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
