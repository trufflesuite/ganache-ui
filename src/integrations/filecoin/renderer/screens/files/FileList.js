import React, { Component } from "react";
import MDSpinner from "react-md-spinner";
import connect from "../../../../../renderer/screens/helpers/connect";

import MiniFileCard from "./MiniFileCard";

class FileList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var content;
    if (this.props.files.inView.length > 0) {
      content = this.props.files.inView.map(file => {
        return (
          <MiniFileCard
            key={`file-${file.cid.toString()}`}
            file={file}
          />
        );
      });
    } else {
      if (this.props.loading) {
        content = (
          <div className="Waiting">
            <MDSpinner
              singleColor="var(--primary-color)"
              size={30}
              borderSize={3}
              className="spinner"
              duration={2666}
            />
          </div>
        );
      } else {
        content = <div className="Waiting">No files</div>;
      }
    }

    return <div className="FileList">{content}</div>;
  }
}

export default connect(
  FileList,
  ["filecoin.core", "core"],
  ["filecoin.files", "files"],
  "appshell",
);
