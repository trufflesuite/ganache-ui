import React, { PureComponent } from "react";
import { remote } from "electron";
import DownloadIcon from "../../../../../renderer/icons/download.svg";
import connect from "../../../../../renderer/screens/helpers/connect";
import * as Files from "../../../common/redux/files/actions";
import OnlyIf from "../../../../../renderer/components/only-if/OnlyIf";
import ProgressBar from "../../../../../renderer/components/progress-bar/ProgressBar";

const dialog = remote.dialog;

export class MiniFileCard extends PureComponent {
  async saveFile(cid, name) {
    const options = {};
    if (name) {
      options.defaultPath = name;
    }
    const userChosenPath = await dialog.showSaveDialog(remote.getCurrentWindow(), options);

    if (userChosenPath && !userChosenPath.canceled) {
      const destination = userChosenPath.filePath;
      this.props.dispatch(Files.downloadFile(cid, destination));
    }
  }

  render() {
    const { file } = this.props;
    const cardStyles = `MiniFileCard`;
    const downloadInProgress = typeof file.download.progress !== "undefined";

    return (
      <section className={cardStyles} key={`file_${file.cid.toString()}_detail`}>
        <div className="PrimaryItems">
          <div className="RowItem">
            <div className="FileCID">
              <div className="Label">IPFS CID</div>
              <div className="Value">{file.cid.toString()}</div>
            </div>
          </div>
          <div className="RowItem">
            <div className="Name">
              <div className="Label">NAME</div>
              <div className="Value">{file.name || "No name assigned"}</div>
            </div>
          </div>
          <div className="RowItem">
            <div className="Size">
              <div className="Label">SIZE</div>
              <div className="Value">{file.size}</div>
            </div>
          </div>
          <div className="RowItem">
            <div className="Download">
              <OnlyIf test={!downloadInProgress}>
                <button onClick={() => this.saveFile(file.cid, file.name) }>
                  <span>DOWNLOAD</span>
                  <DownloadIcon />
                </button>
              </OnlyIf>
              <OnlyIf test={downloadInProgress && !file.download.complete && !file.download.error}>
                <button disabled={true}>
                  <span>DOWNLOADING</span>
                </button>
                <ProgressBar percent={Math.floor((file.download.progress || 0) * 100)} />
              </OnlyIf>
              <OnlyIf test={downloadInProgress && !file.download.complete && file.download.error}>
                <button className="Error"disabled={true}>
                  <span>ERROR</span>
                </button>
              </OnlyIf>
              <OnlyIf test={downloadInProgress && file.download.complete && !file.download.error}>
                <button className="Complete" disabled={true}>
                  <span>COMPLETE</span>
                </button>
              </OnlyIf>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default connect(
  MiniFileCard,
  ["filecoin.core", "core"],
);
